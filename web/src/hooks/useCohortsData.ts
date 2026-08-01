import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../lib/auth";
import {
  listCohorts,
  createCohort,
  getEnrolledStudents,
  getConstraints,
  addConstraint,
  updateConstraintStatus,
  runFormation,
  getFormation,
  overrideFormation,
  commitFormation,
} from "../api";
import type { Cohort, StudentIn, Constraint, Formation, RunFormationIn } from "../types";

export function useCohortsData() {
  const { token } = useAuth();
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCohorts = useCallback(async () => {
    if (!token) {
      setCohorts([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await listCohorts({ token });
      setCohorts(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load cohorts");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCohorts();
  }, [fetchCohorts]);

  const createNewCohort = async (name: string): Promise<Cohort | null> => {
    if (!token) return null;
    try {
      const newCohort = await createCohort(name, { token });
      setCohorts((prev) => [...prev, newCohort]);
      return newCohort;
    } catch (err: any) {
      setError(err.message || "Failed to create cohort");
      return null;
    }
  };

  const fetchEnrolledStudents = useCallback(
    async (cohortId: string): Promise<StudentIn[]> => {
      if (!token || !cohortId) return [];
      try {
        return await getEnrolledStudents(cohortId, { token });
      } catch (err: any) {
        setError(err.message || "Failed to load enrolled students");
        return [];
      }
    },
    [token]
  );

  const fetchCohortConstraints = useCallback(
    async (cohortId: string): Promise<Constraint[]> => {
      if (!token || !cohortId) return [];
      try {
        return await getConstraints(cohortId, { token });
      } catch (err: any) {
        setError(err.message || "Failed to load constraints");
        return [];
      }
    },
    [token]
  );

  const proposeConstraint = async (
    cohortId: string,
    type: string,
    targetStudentId: string
  ): Promise<boolean> => {
    if (!token) return false;
    try {
      await addConstraint(cohortId, type, targetStudentId, { token });
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to propose constraint");
      return false;
    }
  };

  const reviewConstraint = async (
    cohortId: string,
    constraintId: string,
    status: string
  ): Promise<boolean> => {
    if (!token) return false;
    try {
      await updateConstraintStatus(cohortId, constraintId, status, { token });
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to update constraint status");
      return false;
    }
  };

  const triggerFormationRun = async (
    cohortId: string,
    payload: RunFormationIn
  ): Promise<Formation | null> => {
    if (!token) return null;
    try {
      return await runFormation(cohortId, payload, { token });
    } catch (err: any) {
      setError(err.message || "Failed to run formation");
      return null;
    }
  };

  const loadFormation = useCallback(
    async (formationId: string): Promise<Formation | null> => {
      if (!token || !formationId) return null;
      try {
        return await getFormation(formationId, { token });
      } catch (err: any) {
        setError(err.message || "Failed to load formation");
        return null;
      }
    },
    [token]
  );

  const saveTeamOverrides = async (
    formationId: string,
    teams: { id: string; member_ids: string[]; rationale: string }[]
  ): Promise<boolean> => {
    if (!token) return false;
    try {
      await overrideFormation(formationId, teams, { token });
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to save overrides");
      return false;
    }
  };

  const commitTeams = async (formationId: string): Promise<boolean> => {
    if (!token) return false;
    try {
      await commitFormation(formationId, { token });
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to commit formation");
      return false;
    }
  };

  return {
    cohorts,
    loading,
    error,
    refetchCohorts: fetchCohorts,
    createNewCohort,
    fetchEnrolledStudents,
    fetchCohortConstraints,
    proposeConstraint,
    reviewConstraint,
    triggerFormationRun,
    loadFormation,
    saveTeamOverrides,
    commitTeams,
  };
}
