"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectItem } from "@/components/ui/select";
import Loader from "@/components/ui/Loader";
import { useAuthContext } from "@/contexts/AuthContext";
import { 
  getUserProfile, 
  updateUserProfile, 
  changeUserPassword, 
  getDepartmentsForSelect, 
  getJobTitlesForSelect 
} from "@/actions/users/user-settings";
import { toast } from "sonner";
import { ChevronLeft, Save, Lock } from "lucide-react";

const UserSettingsPage = () => {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser, refreshUser } = useAuthContext();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [user, setUser] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [jobTitles, setJobTitles] = useState([]);
  
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    personal_email: "",
    work_email: "",
    mobile: "",
    office_phone: "",
    address: "",
    full_address: "",
    department_id: "",
    job_title_id: "",
    is_active: true,
  });

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [errors, setErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});

  // Check if current user can edit this profile
  const canEdit = currentUser && (
    currentUser.id === params.id || 
    currentUser.role === 'admin' || 
    currentUser.role === 'hr_admin'
  );

  useEffect(() => {
    if (params.id) {
      fetchUserData();
    }
  }, [params.id]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const [userResponse, deptsResponse, jobTitlesResponse] = await Promise.all([
        getUserProfile(params.id),
        getDepartmentsForSelect(),
        getJobTitlesForSelect(),
      ]);

      if (userResponse.success) {
        const userData = userResponse.data;
        setUser(userData);
        setFormData({
          first_name: userData.first_name || "",
          last_name: userData.last_name || "",
          personal_email: userData.personal_email || "",
          work_email: userData.work_email || userData.email || "",
          mobile: userData.mobile || "",
          office_phone: userData.office_phone || "",
          address: userData.address || "",
          full_address: userData.full_address || "",
          department_id: userData.department_id ? userData.department_id.toString() : "",
          job_title_id: userData.job_title_id ? userData.job_title_id.toString() : "",
          is_active: userData.is_active !== false,
        });
      } else {
        toast.error(userResponse.error);
        router.push("/dashboard");
      }

      if (deptsResponse.success) {
        setDepartments(deptsResponse.data);
      }

      if (jobTitlesResponse.success) {
        setJobTitles(jobTitlesResponse.data);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (passwordErrors[field]) {
      setPasswordErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = "First name is required";
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = "Last name is required";
    }
    if (!formData.work_email.trim()) {
      newErrors.work_email = "Work email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.work_email)) {
      newErrors.work_email = "Please enter a valid email";
    }
    if (formData.personal_email && !/\S+@\S+\.\S+/.test(formData.personal_email)) {
      newErrors.personal_email = "Please enter a valid email";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors = {};

    if (!passwordData.current_password) {
      newErrors.current_password = "Current password is required";
    }
    if (!passwordData.new_password) {
      newErrors.new_password = "New password is required";
    } else if (passwordData.new_password.length < 6) {
      newErrors.new_password = "Password must be at least 6 characters";
    }
    if (passwordData.new_password !== passwordData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
    }

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!canEdit) {
      toast.error("You don't have permission to edit this profile");
      return;
    }

    if (!validateForm()) return;

    setSaving(true);
    try {
      const response = await updateUserProfile(params.id, formData);
      
      if (response.success) {
        toast.success("Profile updated successfully");
        
        // Refresh user context if editing own profile
        if (currentUser.id === params.id) {
          await refreshUser();
        }
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!canEdit) {
      toast.error("You don't have permission to change this password");
      return;
    }

    if (!validatePassword()) return;

    setChangingPassword(true);
    try {
      const response = await changeUserPassword(params.id, {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
      
      if (response.success) {
        toast.success("Password changed successfully");
        setPasswordData({
          current_password: "",
          new_password: "",
          confirm_password: "",
        });
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">User not found</p>
      </div>
    );
  }

  const getDepartmentName = (id) => {
    if (!id || !departments.length) return "Unknown Department";
    const dept = departments.find(d => d.id.toString() === id.toString());
    return dept ? dept.name : "Unknown Department";
  };

  const getJobTitleName = (id) => {
    if (!id || !jobTitles.length) return "Unknown Position";
    const job = jobTitles.find(j => j.id.toString() === id.toString());
    return job ? job.name : "Unknown Position";
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-md"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold">User Settings</h1>
          <p className="text-gray-500">
            {currentUser.id === params.id ? "Manage your profile" : "Manage user profile"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><strong>Name:</strong> {user.first_name || ""} {user.last_name || ""}</p>
              <p><strong>Position:</strong> {getJobTitleName(user.job_title_id)}</p>
              <p><strong>Department:</strong> {getDepartmentName(user.department_id)}</p>
              <p><strong>Status:</strong> {user.is_active !== false ? "Active Employee" : "Inactive Employee"}</p>
            </CardContent>
          </Card>

          {user.hire_date && (
            <Card>
              <CardHeader>
                <CardTitle>Employment Dates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p><strong>Hire Date:</strong> {new Date(user.hire_date).toLocaleDateString()}</p>
                {user.leave_date && (
                  <p><strong>Leave Date:</strong> {new Date(user.leave_date).toLocaleDateString()}</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>

          <CardContent className="space-y-8">

            {/* Personal Info */}
            <section>
              <h2 className="font-semibold mb-4">Personal Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>First Name *</Label>
                  <Input 
                    value={formData.first_name}
                    onChange={(e) => handleInputChange("first_name", e.target.value)}
                    disabled={!canEdit}
                  />
                  {errors.first_name && (
                    <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>
                  )}
                </div>
                <div>
                  <Label>Last Name *</Label>
                  <Input 
                    value={formData.last_name}
                    onChange={(e) => handleInputChange("last_name", e.target.value)}
                    disabled={!canEdit}
                  />
                  {errors.last_name && (
                    <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>
                  )}
                </div>
                <div>
                  <Label>Personal Email</Label>
                  <Input 
                    type="email" 
                    value={formData.personal_email}
                    onChange={(e) => handleInputChange("personal_email", e.target.value)}
                    disabled={!canEdit}
                  />
                  {errors.personal_email && (
                    <p className="text-red-500 text-sm mt-1">{errors.personal_email}</p>
                  )}
                </div>
                <div>
                  <Label>Work Email *</Label>
                  <Input 
                    type="email" 
                    value={formData.work_email}
                    onChange={(e) => handleInputChange("work_email", e.target.value)}
                    disabled={!canEdit}
                  />
                  {errors.work_email && (
                    <p className="text-red-500 text-sm mt-1">{errors.work_email}</p>
                  )}
                </div>
                <div>
                  <Label>Mobile</Label>
                  <Input 
                    value={formData.mobile}
                    onChange={(e) => handleInputChange("mobile", e.target.value)}
                    disabled={!canEdit}
                  />
                </div>
                <div>
                  <Label>Office Phone</Label>
                  <Input 
                    value={formData.office_phone}
                    onChange={(e) => handleInputChange("office_phone", e.target.value)}
                    disabled={!canEdit}
                  />
                </div>
              </div>
            </section>

            <Separator />

            {/* Address */}
            <section>
              <h2 className="font-semibold mb-4">Address</h2>
              <div className="space-y-4">
                <div>
                  <Label>Address</Label>
                  <Input 
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    disabled={!canEdit}
                  />
                </div>
                <div>
                  <Label>Full Address</Label>
                  <Textarea 
                    value={formData.full_address}
                    onChange={(e) => handleInputChange("full_address", e.target.value)}
                    disabled={!canEdit}
                  />
                </div>
              </div>
            </section>

            <Separator />

            {/* Job Info */}
            <section>
              <h2 className="font-semibold mb-4">Job Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Department</Label>
                  <Select 
                    value={formData.department_id}
                    onChange={(value) => handleInputChange("department_id", value)}
                    disabled={!canEdit}
                  >
                    <SelectItem value="">Select Department</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </Select>
                </div>

                <div>
                  <Label>Job Title</Label>
                  <Select 
                    value={formData.job_title_id}
                    onChange={(value) => handleInputChange("job_title_id", value)}
                    disabled={!canEdit}
                  >
                    <SelectItem value="">Select Job Title</SelectItem>
                    {jobTitles.map((job) => (
                      <SelectItem key={job.id} value={job.id.toString()}>
                        {job.name}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
              </div>
            </section>

            {(currentUser.role === 'admin' || currentUser.role === 'hr_admin') && (
              <>
                <Separator />
                {/* Account Status */}
                <section>
                  <h2 className="font-semibold mb-4">Account Status</h2>
                  <div className="flex items-center space-x-3">
                    <Switch 
                      checked={formData.is_active}
                      onChange={(e) => handleInputChange("is_active", e.target.checked)}
                      disabled={!canEdit}
                    />
                    <span>Currently Employed</span>
                  </div>
                </section>
              </>
            )}

            <Separator />

            {/* Password */}
            <section>
              <h2 className="font-semibold mb-4">Change Password</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Label>Current Password</Label>
                  <Input 
                    type="password" 
                    placeholder="Enter current password"
                    value={passwordData.current_password}
                    onChange={(e) => handlePasswordChange("current_password", e.target.value)}
                    disabled={!canEdit}
                  />
                  {passwordErrors.current_password && (
                    <p className="text-red-500 text-sm mt-1">{passwordErrors.current_password}</p>
                  )}
                </div>
                <div>
                  <Label>New Password</Label>
                  <Input 
                    type="password" 
                    placeholder="Enter new password"
                    value={passwordData.new_password}
                    onChange={(e) => handlePasswordChange("new_password", e.target.value)}
                    disabled={!canEdit}
                  />
                  {passwordErrors.new_password && (
                    <p className="text-red-500 text-sm mt-1">{passwordErrors.new_password}</p>
                  )}
                </div>
                <div>
                  <Label>Confirm Password</Label>
                  <Input 
                    type="password" 
                    placeholder="Confirm new password"
                    value={passwordData.confirm_password}
                    onChange={(e) => handlePasswordChange("confirm_password", e.target.value)}
                    disabled={!canEdit}
                  />
                  {passwordErrors.confirm_password && (
                    <p className="text-red-500 text-sm mt-1">{passwordErrors.confirm_password}</p>
                  )}
                </div>
                {canEdit && (
                  <div className="md:col-span-2">
                    <Button 
                      onClick={handleChangePassword}
                      disabled={changingPassword || !passwordData.current_password || !passwordData.new_password}
                      className="flex items-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      {changingPassword ? "Changing..." : "Change Password"}
                    </Button>
                  </div>
                )}
              </div>
            </section>

            {canEdit && (
              <div className="flex justify-end">
                <Button 
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default UserSettingsPage;
