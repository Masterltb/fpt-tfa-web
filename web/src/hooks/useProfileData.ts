import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../lib/auth";
import { getProfile, updateProfile } from "../api";
import type { StudentIn } from "../types";

export function useProfileData() {
  const { token, user } = useAuth();
  const [profile, setProfile] = useState<StudentIn | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!token) {
      setProfile(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getProfile({ token });
      setProfile(data);
    } catch (err: any) {
      // If 404, we initialize with default values for new student
      if (err.message && err.message.includes("404")) {
        setProfile({
          id: user?.uid || "s-1",
          name: user?.displayName || "Student",
          major: "Software Engineering",
          experience_years: 1,
          desired_role: "other",
          availability: [],
          skills: [],
        });
      } else {
        setError(err.message || "Failed to load profile");
      }
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const saveProfile = async (updates: Partial<StudentIn>): Promise<boolean> => {
    if (!token || !profile) return false;
    const updated: StudentIn = { ...profile, ...updates };
    setProfile(updated);
    try {
      await updateProfile(
        {
          name: updated.name || user?.displayName || "Student",
          major: updated.major || "Software Engineering",
          experience_years: Number(updated.experience_years) || 0,
          desired_role: updated.desired_role || "other",
          availability: updated.availability || [],
          skills: updated.skills || [],
        },
        { token }
      );
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to save profile");
      return false;
    }
  };

  return { profile, loading, error, saveProfile, refetch: fetchProfile };
}
