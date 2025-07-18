import React, { useState, useEffect } from 'react'
import { useChangePasswordMutation, useGetPerformerProfileQuery, useUpdatePerformerProfileMutation } from '../../apis/profile'
import toast from 'react-hot-toast'

const Settings = () => {
  const [newPassword, setNewPassword] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  
  const [changePassword, { isLoading }] = useChangePasswordMutation()
  const { data: profileData, isLoading: isLoadingProfile } = useGetPerformerProfileQuery({})
  const [updateProfile, { isLoading: isUpdating }] = useUpdatePerformerProfileMutation()

  // Load profile data when component mounts
  useEffect(() => {
    if (profileData?.user) {
      setPhone(profileData.user.phone || '')
      setEmail(profileData.user.email || '')
    }
  }, [profileData])

  const handleResetClick = () => {
    if (!newPassword) return
    
    // Validate password
    if (newPassword.length < 8 || !/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      setPasswordError('Password must be at least 8 characters and contain a special symbol')
      return
    }
    
    setPasswordError('')
    setShowModal(true)
  }

  const confirmPasswordChange = async () => {
    try {
      await changePassword({ newPassword }).unwrap()
      setShowModal(false)
      setNewPassword('')
      toast.success('Password changed successfully')
    } catch (error: any) {
      alert(error?.data?.message ?? 'Failed to change password')
    }
  }

  const handleProfileUpdate = async () => {
    try {
      const updateData = {
        phone: phone,
        email: email
      }
      
      await updateProfile({ data: updateData }).unwrap()
      setIsEditing(false)
      toast.success('Profile updated successfully!')
    } catch (error: any) {
      console.error('Failed to update profile:', error)
      toast.error('Failed to update profile. Please try again.')
    }
  }

  const togglePasswordVisibility = () => setShowPassword(!showPassword)

  const handleEmailClick = (type: string) => {
     const email = 'support@dragspace.com'
     const subjects = {
      bug: 'Bug Report',
      feature: 'Feature Request',
      support: 'Support & Feedback'
    }
    
    const subject = subjects[type as keyof typeof subjects]
    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}`
    
    // Try to open email client
    const link = document.createElement('a')
    link.href = mailtoLink
    link.click()
    
    // Fallback: copy email to clipboard after a short delay
    setTimeout(() => {
      navigator.clipboard.writeText(email).then(() => {
        toast.success(`Email address copied to clipboard! Please email us at ${email} with subject: ${subject}`)
      }).catch(() => {
        toast.error(`Please email us at ${email} with subject: ${subject}`)
      })
    }, 1000)
  }

  if (isLoadingProfile) {
    return (
      <div className="flex mt-16 justify-center min-h-screen max-w-[850px]">
        <div className="w-8 h-8 border-4 border-[#FF00A2] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-8 mb-12">
      {/* Profile Information Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-space-grotesk text-base text-white font-normal leading-none">Profile Information</h2>
          <div 
            className="flex items-center gap-2 text-white font-['Space_Grotesk'] text-[16px] leading-[100%] cursor-pointer"
            onClick={() => setIsEditing(!isEditing)}
          >
            <img src="/profile/edit.svg" alt="Edit" className="w-4 h-4" />
            {isEditing ? "cancel" : "edit"}
          </div>
        </div>
        
        <div className="mb-4 ml-8 mt-8">
          <label className="block font-space-grotesk text-base text-[#A4A4A4] mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            placeholder="Enter phone number"
            className="w-[210px] h-[40px] rounded-[35px] border border-white/20 bg-transparent text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF00A2]"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={!isEditing}
          />
        </div>

        <div className="mb-4 ml-8">
          <label className="block font-space-grotesk text-base text-[#A4A4A4] mb-2">
            Email Address
          </label>
          <input
            type="email"
            placeholder="Enter email address"
            className="w-[210px] h-[40px] rounded-[35px] border border-white/20 bg-transparent text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF00A2]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={!isEditing}
          />
        </div>

        {isEditing && (
          <div className="ml-8 mt-4">
            <button
              onClick={handleProfileUpdate}
              disabled={isUpdating}
              className={`bg-[#FF00A2] rounded-[35px] px-8 py-2 text-white flex items-center gap-2 ${
                isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              {isUpdating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Updating...</span>
                </>
              ) : (
                'Update Profile'
              )}
            </button>
          </div>
        )}
      </div>

      {/* <div className="mb-8">
        <h2 className="font-space-grotesk text-base text-white font-normal leading-none">Notifications & Alerts</h2>
        
        <div className="mb-4 ml-8 mt-8">
          <label className="block font-space-grotesk text-base text-[#A4A4A4] mb-2">
            Email Notifications
          </label>
          <div className="relative">
            <select className="w-[210px] h-[40px] rounded-[35px] border border-white/20 bg-transparent text-white px-4 py-2 appearance-none focus:outline-none">
              <option value="on">On</option>
              <option value="off">Off</option>
            </select>
            <div className="absolute inset-y-0 left-[180px] flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="mb-4 ml-8">
          <label className="block font-space-grotesk text-base text-[#A4A4A4] mb-2">
            Alert Preferences
          </label>
          <div className="relative">
            <select className="w-[210px] h-[40px] rounded-[35px] border border-white/20 bg-transparent text-white px-4 py-2 appearance-none focus:outline-none">
              <option value="real-time">Real-Time</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
            <div className="absolute inset-y-0 left-[180px] flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div> */}

      <div className="mb-8">
        <h2 className="font-space-grotesk text-base text-white font-normal leading-none">Password Reset</h2>
        
        <div className="mb-4 ml-8 mt-8">
          <div className="relative">
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Enter new password" 
                className="w-[210px] h-[40px] rounded-[35px] border border-white/20 bg-transparent text-white px-4 py-2 focus:outline-none" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button 
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute left-[180px] top-1/2 transform -translate-y-1/2 text-white"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
            <div className="text-xs text-[#A4A4A4] mt-1">
              Password must be at least 8 characters with a special symbol
            </div>
            <button 
              onClick={handleResetClick} 
              className={`inset-y-0 flex items-center bg-[#FF00A2] rounded-[35px] px-8 mt-3 py-2 text-white ${newPassword ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
              disabled={!newPassword}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-space-grotesk mt-12 text-base text-white font-normal leading-none">Support & Feedback</h2>
        <div className="flex flex-col gap-1 mt-8 ml-8">
          <div className="font-space-grotesk text-base text-[#A4A4A4]">
            <a 
              onClick={() => handleEmailClick('bug')}
              className="text-[#FF00A2] hover:underline cursor-pointer"
            >
              Report a Bug
            </a>
          </div>
          <div className="font-space-grotesk text-base text-[#A4A4A4]">
            <a 
              onClick={() => handleEmailClick('feature')}
              className="text-[#FF00A2] hover:underline cursor-pointer"
            >
              Feature Requests
            </a>
          </div>
          <div className="font-space-grotesk text-base text-[#A4A4A4]">
            <a 
              onClick={() => handleEmailClick('support')}
              className="text-[#FF00A2] hover:underline cursor-pointer"
            >
              Support & Feedback
            </a>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1D1D1D] p-6 rounded-lg max-w-md w-full">
            <h3 className="text-white text-lg mb-4">Confirm Password Change</h3>
            <p className="text-[#A4A4A4] mb-6">Are you sure you want to change your password?</p>
            <div className="flex justify-end space-x-4">
              <button 
                onClick={() => setShowModal(false)} 
                className="px-4 py-2 border border-white/20 text-white rounded-md cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={confirmPasswordChange} 
                className="px-4 py-2 bg-[#FF00A2] text-white rounded-md flex items-center cursor-pointer"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Confirm'}
                {isLoading && (
                  <svg className="animate-spin ml-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings
