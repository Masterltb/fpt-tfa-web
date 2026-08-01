"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectConstraint = exports.approveConstraint = exports.overrideCommittedTeam = exports.commitFormationResult = exports.createFormationRun = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
const zod_1 = require("zod");
admin.initializeApp();
const db = admin.firestore();
// Helper to check user roles
async function verifyRole(cohortId, uid, allowedRoles) {
    // 1. Check global admin first
    const userDoc = await db.doc(`users/${uid}`).get();
    if (userDoc.exists && userDoc.data()?.role === "ADMIN") {
        return;
    }
    // 2. Check cohort member role
    const memberDoc = await db.doc(`cohorts/${cohortId}/members/${uid}`).get();
    if (!memberDoc.exists) {
        throw new https_1.HttpsError("permission-denied", "User is not a member of the cohort.");
    }
    const role = memberDoc.data()?.role || "STUDENT";
    if (!allowedRoles.includes(role)) {
        throw new https_1.HttpsError("permission-denied", `Operation requires role(s): ${allowedRoles.join(", ")}`);
    }
}
// 1. createFormationRun
const createRunSchema = zod_1.z.object({
    cohortId: zod_1.z.string(),
    projectId: zod_1.z.string(),
    seed: zod_1.z.number().int(),
    weights: zod_1.z.object({
        balance: zod_1.z.number().min(0).max(1).optional(),
        schedule: zod_1.z.number().min(0).max(1).optional(),
        preference: zod_1.z.number().min(0).max(1).optional(),
        role: zod_1.z.number().min(0).max(1).optional(),
    }).optional(),
});
exports.createFormationRun = (0, https_1.onCall)(async (request) => {
    const auth = request.auth;
    if (!auth) {
        throw new https_1.HttpsError("unauthenticated", "User must be authenticated.");
    }
    const parsed = createRunSchema.safeParse(request.data);
    if (!parsed.success) {
        throw new https_1.HttpsError("invalid-argument", "Invalid arguments: " + parsed.error.message);
    }
    const { cohortId, projectId, seed, weights } = parsed.data;
    // Validate lecturer role
    await verifyRole(cohortId, auth.uid, ["OWNER", "LECTURER"]);
    // Verify cohort and project exist
    const cohortDoc = await db.doc(`cohorts/${cohortId}`).get();
    if (!cohortDoc.exists) {
        throw new https_1.HttpsError("not-found", "Cohort not found.");
    }
    const projectDoc = await db.doc(`cohorts/${cohortId}/projects/${projectId}`).get();
    if (!projectDoc.exists) {
        throw new https_1.HttpsError("not-found", "Project not found.");
    }
    const runRef = db.collection(`cohorts/${cohortId}/formationRuns`).doc();
    const runId = runRef.id;
    const batch = db.batch();
    // Set queued formation run
    batch.set(runRef, {
        algorithmVersion: "1.0.0",
        randomSeed: seed,
        inputSnapshotHash: "stub_hash_sha256",
        parameterSnapshot: weights || { balance: 1.0, schedule: 1.0, preference: 1.0, role: 1.0 },
        profileVersion: "v1",
        constraintSnapshotVersion: "v1",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: auth.uid,
        status: "QUEUED",
        resultMetrics: {},
        infeasibilityDetails: [],
    });
    // Write audit event
    const auditRef = db.collection(`cohorts/${cohortId}/auditEvents`).doc();
    batch.set(auditRef, {
        type: "FORMATION_RUN_CREATED",
        actor: auth.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        details: { runId, projectId, seed },
    });
    await batch.commit();
    return { runId };
});
// 2. commitFormationResult
const commitSchema = zod_1.z.object({
    cohortId: zod_1.z.string(),
    runId: zod_1.z.string(),
});
exports.commitFormationResult = (0, https_1.onCall)(async (request) => {
    const auth = request.auth;
    if (!auth) {
        throw new https_1.HttpsError("unauthenticated", "User must be authenticated.");
    }
    const parsed = commitSchema.safeParse(request.data);
    if (!parsed.success) {
        throw new https_1.HttpsError("invalid-argument", "Invalid arguments: " + parsed.error.message);
    }
    const { cohortId, runId } = parsed.data;
    // Validate lecturer role
    await verifyRole(cohortId, auth.uid, ["OWNER", "LECTURER"]);
    // We run this inside a transaction for atomicity
    const result = await db.runTransaction(async (transaction) => {
        const cohortRef = db.doc(`cohorts/${cohortId}`);
        const runRef = db.doc(`cohorts/${cohortId}/formationRuns/${runId}`);
        const cohortSnap = await transaction.get(cohortRef);
        if (!cohortSnap.exists) {
            throw new https_1.HttpsError("not-found", "Cohort not found.");
        }
        const runSnap = await transaction.get(runRef);
        if (!runSnap.exists) {
            throw new https_1.HttpsError("not-found", "Formation run not found.");
        }
        const runData = runSnap.data();
        if (!runData) {
            throw new https_1.HttpsError("internal", "Run document is empty.");
        }
        // Idempotency: if already committed, return the current activeResultId
        if (runData.status === "COMMITTED") {
            return { committed: true, resultId: cohortSnap.data()?.activeResultId };
        }
        if (runData.status !== "SUCCEEDED") {
            throw new https_1.HttpsError("failed-precondition", `Cannot commit a run in status ${runData.status}. Status must be SUCCEEDED.`);
        }
        // Get the generated teams from this run
        const teamsQuery = runRef.collection("teams");
        const teamsSnap = await transaction.get(teamsQuery);
        // Create new committed result
        const currentVersion = cohortSnap.data()?.resultVersion || 0;
        const nextVersion = currentVersion + 1;
        const resultRef = db.collection(`cohorts/${cohortId}/committedResults`).doc();
        const resultId = resultRef.id;
        // Create the committed result metadata
        transaction.set(resultRef, {
            status: "ACTIVE",
            runId: runId,
            version: nextVersion,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: auth.uid,
        });
        // Write all teams to the committed result
        teamsSnap.docs.forEach((teamDoc) => {
            const teamData = teamDoc.data();
            const teamRef = resultRef.collection("teams").doc(teamDoc.id);
            transaction.set(teamRef, {
                member_ids: teamData.member_ids,
                rationale: teamData.rationale || "",
                scores: teamData.scores || {},
            });
        });
        // Supersede previous active result if exists
        const prevActiveId = cohortSnap.data()?.activeResultId;
        if (prevActiveId) {
            const prevResultRef = db.doc(`cohorts/${cohortId}/committedResults/${prevActiveId}`);
            transaction.update(prevResultRef, {
                status: "SUPERSEDED",
                supersededAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }
        // Update cohort metadata
        transaction.update(cohortRef, {
            activeResultId: resultId,
            resultVersion: admin.firestore.FieldValue.increment(1),
        });
        // Mark the run status as COMMITTED
        transaction.update(runRef, {
            status: "COMMITTED",
        });
        // Write audit event
        const auditRef = db.collection(`cohorts/${cohortId}/auditEvents`).doc();
        transaction.set(auditRef, {
            type: "FORMATION_RESULT_COMMITTED",
            actor: auth.uid,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            details: { runId, resultId },
        });
        return { committed: true, resultId };
    });
    return result;
});
// 3. overrideCommittedTeam
const overrideSchema = zod_1.z.object({
    cohortId: zod_1.z.string(),
    resultId: zod_1.z.string(),
    teamOverrides: zod_1.z.record(zod_1.z.string(), zod_1.z.array(zod_1.z.string())),
});
exports.overrideCommittedTeam = (0, https_1.onCall)(async (request) => {
    const auth = request.auth;
    if (!auth) {
        throw new https_1.HttpsError("unauthenticated", "User must be authenticated.");
    }
    const parsed = overrideSchema.safeParse(request.data);
    if (!parsed.success) {
        throw new https_1.HttpsError("invalid-argument", "Invalid arguments: " + parsed.error.message);
    }
    const { cohortId, resultId, teamOverrides } = parsed.data;
    // Validate lecturer role
    await verifyRole(cohortId, auth.uid, ["OWNER", "LECTURER"]);
    const result = await db.runTransaction(async (transaction) => {
        const cohortRef = db.doc(`cohorts/${cohortId}`);
        const activeResultRef = db.doc(`cohorts/${cohortId}/committedResults/${resultId}`);
        const cohortSnap = await transaction.get(cohortRef);
        if (!cohortSnap.exists) {
            throw new https_1.HttpsError("not-found", "Cohort not found.");
        }
        const resultSnap = await transaction.get(activeResultRef);
        if (!resultSnap.exists) {
            throw new https_1.HttpsError("not-found", "Active committed result not found.");
        }
        if (resultSnap.data()?.status !== "ACTIVE") {
            throw new https_1.HttpsError("failed-precondition", "Result to override must be ACTIVE.");
        }
        const currentVersion = cohortSnap.data()?.resultVersion || 0;
        const nextVersion = currentVersion + 1;
        const newResultRef = db.collection(`cohorts/${cohortId}/committedResults`).doc();
        const newResultId = newResultRef.id;
        // Create the new result
        transaction.set(newResultRef, {
            status: "ACTIVE",
            runId: resultSnap.data()?.runId || "manual_override",
            version: nextVersion,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: auth.uid,
        });
        // Copy teams from old result, applying overrides where matched
        const teamsSnap = await transaction.get(activeResultRef.collection("teams"));
        teamsSnap.docs.forEach((teamDoc) => {
            const teamId = teamDoc.id;
            const teamData = teamDoc.data();
            const newTeamRef = newResultRef.collection("teams").doc(teamId);
            const overriddenMembers = teamOverrides[teamId];
            transaction.set(newTeamRef, {
                member_ids: overriddenMembers !== undefined ? overriddenMembers : teamData.member_ids,
                rationale: overriddenMembers !== undefined
                    ? "Manually overridden by Lecturer."
                    : (teamData.rationale || ""),
                scores: teamData.scores || {},
            });
        });
        // Mark old as superseded
        transaction.update(activeResultRef, {
            status: "SUPERSEDED",
            supersededAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        // Update cohort metadata
        transaction.update(cohortRef, {
            activeResultId: newResultId,
            resultVersion: admin.firestore.FieldValue.increment(1),
        });
        // Write audit event
        const auditRef = db.collection(`cohorts/${cohortId}/auditEvents`).doc();
        transaction.set(auditRef, {
            type: "COMMIT_RESULT_OVERRIDDEN",
            actor: auth.uid,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            details: { originalResultId: resultId, newResultId },
        });
        return { overridden: true, resultId: newResultId };
    });
    return result;
});
// 4. approveConstraint
const constraintSchema = zod_1.z.object({
    cohortId: zod_1.z.string(),
    constraintId: zod_1.z.string(),
});
exports.approveConstraint = (0, https_1.onCall)(async (request) => {
    const auth = request.auth;
    if (!auth) {
        throw new https_1.HttpsError("unauthenticated", "User must be authenticated.");
    }
    const parsed = constraintSchema.safeParse(request.data);
    if (!parsed.success) {
        throw new https_1.HttpsError("invalid-argument", "Invalid arguments: " + parsed.error.message);
    }
    const { cohortId, constraintId } = parsed.data;
    // Validate lecturer role
    await verifyRole(cohortId, auth.uid, ["OWNER", "LECTURER"]);
    const constraintRef = db.doc(`cohorts/${cohortId}/constraints/${constraintId}`);
    const snap = await constraintRef.get();
    if (!snap.exists) {
        throw new https_1.HttpsError("not-found", "Constraint not found.");
    }
    await db.runTransaction(async (transaction) => {
        transaction.update(constraintRef, {
            status: "APPROVED",
            resolvedBy: auth.uid,
            resolvedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        const auditRef = db.collection(`cohorts/${cohortId}/auditEvents`).doc();
        transaction.set(auditRef, {
            type: "CONSTRAINT_APPROVED",
            actor: auth.uid,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            details: { constraintId },
        });
    });
    return { success: true };
});
// 5. rejectConstraint
exports.rejectConstraint = (0, https_1.onCall)(async (request) => {
    const auth = request.auth;
    if (!auth) {
        throw new https_1.HttpsError("unauthenticated", "User must be authenticated.");
    }
    const parsed = constraintSchema.safeParse(request.data);
    if (!parsed.success) {
        throw new https_1.HttpsError("invalid-argument", "Invalid arguments: " + parsed.error.message);
    }
    const { cohortId, constraintId } = parsed.data;
    // Validate lecturer role
    await verifyRole(cohortId, auth.uid, ["OWNER", "LECTURER"]);
    const constraintRef = db.doc(`cohorts/${cohortId}/constraints/${constraintId}`);
    const snap = await constraintRef.get();
    if (!snap.exists) {
        throw new https_1.HttpsError("not-found", "Constraint not found.");
    }
    await db.runTransaction(async (transaction) => {
        transaction.update(constraintRef, {
            status: "REJECTED",
            resolvedBy: auth.uid,
            resolvedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        const auditRef = db.collection(`cohorts/${cohortId}/auditEvents`).doc();
        transaction.set(auditRef, {
            type: "CONSTRAINT_REJECTED",
            actor: auth.uid,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            details: { constraintId },
        });
    });
    return { success: true };
});
//# sourceMappingURL=index.js.map