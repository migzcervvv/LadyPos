// src/features/profile/hooks/useProfile.js
import { useState, useCallback } from "react";
import { useAuth } from "../hooks/AuthContext.jsx";
import {
  updateProfile,
  updatePassword,
} from "../../features/auth/api/authApi.js";
import { parseError } from "../../features/auth/utils/errorhandler.js";
import { normalizePHPhone, isValidPHPhone } from "../utils/phoneUtils.js";
import toast from "react-hot-toast";

const validateProfileFields = (data) => {
  const errors = {};
  if (!data.name?.trim()) errors.name = "Name is required";
  if (!data.phone?.trim()) {
    errors.phone = "Phone is required";
  } else if (!isValidPHPhone(normalizePHPhone(data.phone))) {
    errors.phone = "Enter a valid PH number (09XXXXXXXXX or +639XXXXXXXXX)";
  }
  return errors;
};

const validatePasswordFields = (data) => {
  const errors = {};
  if (!data.currentPassword?.trim())
    errors.currentPassword = "Current password is required";
  if (!data.newPassword || data.newPassword.length < 6)
    errors.newPassword = "Minimum 6 characters";
  if (data.newPassword !== data.confirmPassword)
    errors.confirmPassword = "Passwords do not match";
  return errors;
};

export function useProfile() {
  const { user, jwt, setUser } = useAuth();

  const [profileLoading, setProfileLoading] = useState(false);
  const [identifierLoading, setIdentifierLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [profileErrors, setProfileErrors] = useState({});
  const [identifierError, setIdentifierError] = useState("");
  const [passwordErrors, setPasswordErrors] = useState({});

  const saveProfile = useCallback(
    async (formData) => {
      const errors = validateProfileFields(formData);
      if (Object.keys(errors).length) {
        setProfileErrors(errors);
        return false;
      }
      setProfileErrors({});
      setProfileLoading(true);
      try {
        const updated = await updateProfile(
          {
            name: formData.name.trim(),
            phone: normalizePHPhone(formData.phone),
            address: formData.address?.trim() || null,
          },
          jwt,
        );
        setUser((prev) => ({ ...prev, ...updated }));
        toast.success("Profile updated");
        return true;
      } catch (err) {
        toast.error(parseError(err));
        return false;
      } finally {
        setProfileLoading(false);
      }
    },
    [jwt, setUser],
  );

  const saveIdentifier = useCallback(
    async (identifier) => {
      const trimmed = identifier?.trim().toLowerCase();
      if (!trimmed || trimmed.length < 3) {
        setIdentifierError("Identifier must be at least 3 characters");
        return false;
      }
      setIdentifierError("");
      setIdentifierLoading(true);
      try {
        const updated = await updateProfile({ identifier: trimmed }, jwt);
        setUser((prev) => ({
          ...prev,
          identifier: updated.identifier ?? trimmed,
        }));
        toast.success("Identifier updated");
        return true;
      } catch (err) {
        toast.error(parseError(err));
        return false;
      } finally {
        setIdentifierLoading(false);
      }
    },
    [jwt, setUser],
  );

  const savePassword = useCallback(
    async (formData) => {
      const errors = validatePasswordFields(formData);
      if (Object.keys(errors).length) {
        setPasswordErrors(errors);
        return false;
      }
      setPasswordErrors({});
      setPasswordLoading(true);
      try {
        await updatePassword(
          {
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword,
          },
          jwt,
        );
        toast.success("Password updated");
        return true;
      } catch (err) {
        toast.error(parseError(err));
        return false;
      } finally {
        setPasswordLoading(false);
      }
    },
    [jwt],
  );

  return {
    user,
    profileLoading,
    identifierLoading,
    passwordLoading,
    profileErrors,
    identifierError,
    passwordErrors,
    setProfileErrors,
    setIdentifierError,
    setPasswordErrors,
    saveProfile,
    saveIdentifier,
    savePassword,
  };
}
