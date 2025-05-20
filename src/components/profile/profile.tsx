import { Controller, useForm } from "react-hook-form";
import {
  useGetSingleVenueByIdQuery,
  useUpdateVenueProfileMutation,
} from "../../apis/venues";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Select from "react-select";
import CustomSelect from "../../utils/CustomSelect";
import { Clock, Edit, X } from "lucide-react";

interface MediaSlot {
  url: string;
  type: "image" | "video" | "none";
  cloudUrl?: string;
  uploading?: boolean;
}

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [logoUrl, setLogoUrl] = useState("");
  const [logoPreview, setLogoPreview] = useState("");
  const { register, handleSubmit, control, reset } = useForm();
  const venueId = JSON.parse(localStorage.getItem("venueId") || '""');
  const [logoUploading, setLogoUploading] = useState(false);

  const [mediaSlots, setMediaSlots] = useState<MediaSlot[]>(
    Array(10).fill({
      url: "",
      type: "none",
      cloudUrl: "",
      uploading: false,
    })
  );

  const venueOptions = [
    { value: "bar/club", label: "Bar/Club" },
    { value: "restaurant/dining", label: "Restaurants/Dining" },
    { value: "other", label: "Other" },
  ];

  const [updateProfile, { isLoading: isUpdating }] =
    useUpdateVenueProfileMutation();
  const { data: profileData, isLoading } = useGetSingleVenueByIdQuery(venueId);

  const handleLogoUpload = async () => {
    if (!isEditing) return;

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg,image/png,image/gif";

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const maxSize = 25 * 1024 * 1024;
        if (file.size > maxSize) {
          toast.error(
            "File size exceeds 25MB limit. Please choose a smaller file."
          );
          return;
        }

        try {
          setLogoUploading(true);
          const reader = new FileReader();
          reader.onload = () => {
            setLogoPreview(reader.result as string);
          };
          reader.readAsDataURL(file);

          const timestamp = Math.round(new Date().getTime() / 1000).toString();
          const str_to_sign = `timestamp=${timestamp}${
            import.meta.env.VITE_CLOUDINARY_API_SECRET
          }`;
          const signature = await generateSHA1(str_to_sign);

          const formData = new FormData();
          formData.append("file", file);
          formData.append("api_key", import.meta.env.VITE_CLOUDINARY_API_KEY);
          formData.append("timestamp", timestamp);
          formData.append("signature", signature);

          const response = await fetch(
            `https://api.cloudinary.com/v1_1/${
              import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
            }/image/upload`,
            {
              method: "POST",
              body: formData,
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || "Upload failed");
          }

          const data = await response.json();
          setLogoUrl(data.secure_url);
          toast.success("Logo uploaded successfully!");
        } catch (error) {
          console.error("Failed to upload logo:", error);
          toast.error("Failed to upload logo. Please try again.");
        } finally {
          setLogoUploading(false);
        }
      }
    };

    input.click();
  };

  const removeLogo = () => {
    setLogoUrl("");
    setLogoPreview("");
  };

  const generateSHA1 = async (message: string) => {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-1", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return hashHex;
  };

  const handleMediaSelect = async (index: any) => {
    if (!isEditing) return;

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg,image/png,image/gif,video/mp4,video/quicktime";
    input.multiple = false;

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const maxSize = 25 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error(
          "File size exceeds 25MB limit. Please choose a smaller file."
        );
        return;
      }

      try {
        // Set uploading state for this slot
        setMediaSlots((prev) =>
          prev.map((slot, i) =>
            i === index ? { ...slot, uploading: true } : slot
          )
        );

        const previewUrl = URL.createObjectURL(file);
        const isVideo = file.type.startsWith("video/");

        // Update preview immediately
        setMediaSlots((prev) =>
          prev.map((slot, i) =>
            i === index
              ? {
                  ...slot,
                  url: previewUrl,
                  type: isVideo ? "video" : "image",
                  uploading: true,
                }
              : slot
          )
        );

        // Upload to Cloudinary
        const timestamp = Math.round(new Date().getTime() / 1000).toString();
        const str_to_sign = `timestamp=${timestamp}${
          import.meta.env.VITE_CLOUDINARY_API_SECRET
        }`;
        const signature = await generateSHA1(str_to_sign);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", import.meta.env.VITE_CLOUDINARY_API_KEY);
        formData.append("timestamp", timestamp);
        formData.append("signature", signature);

        const resourceType = isVideo ? "video" : "image";
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${
            import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
          }/${resourceType}/upload`,
          { method: "POST", body: formData }
        );

        if (!response.ok) throw new Error("Upload failed");

        const data = await response.json();

        // Update with final Cloudinary URL
        setMediaSlots((prev) =>
          prev.map((slot, i) =>
            i === index
              ? {
                  ...slot,
                  url: previewUrl,
                  type: isVideo ? "video" : "image",
                  cloudUrl: data.secure_url,
                  uploading: false,
                }
              : slot
          )
        );

        toast.success(`${isVideo ? "Video" : "Image"} uploaded successfully!`);
      } catch (error) {
        console.error("Failed to upload media:", error);
        toast.error("Failed to upload media. Please try again.");

        // Revert on error
        setMediaSlots((prev) =>
          prev.map((slot, i) =>
            i === index ? { url: "", type: "none", uploading: false } : slot
          )
        );
      }
    };

    input.click();
  };

  // 3. Fixed media removal handler
  const removeMedia = (index: any) => {
    setMediaSlots((prev) =>
      prev.map((slot, i) =>
        i === index
          ? { url: "", type: "none", cloudUrl: "", uploading: false }
          : slot
      )
    );
  };

  // 4. Fixed render media preview function
  const renderMediaPreview = (index: any) => {
    const slot = mediaSlots[index];

    if (slot.type === "none") {
      return (
        <div className="w-full h-full flex items-center justify-center">
          {slot.uploading ? (
            <div className="w-8 h-8 border-4 border-[#FF00A2] border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <span className="text-[#383838] text-2xl md:text-3xl">+</span>
          )}
        </div>
      );
    }

    return (
      <div className="w-full h-full relative group">
        {slot.uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
            <div className="w-8 h-8 border-4 border-[#FF00A2] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {slot.type === "video" ? (
          <div className="relative w-full h-full">
            <video
              className="w-full h-full object-cover"
              src={slot.url}
              controls
              controlsList="nodownload noremoteplayback noplaybackrate"
              onClick={(e) => e.stopPropagation()}
            />
            {isEditing && (
              <div className="absolute top-2 right-2 z-10 flex gap-2">
                <button
                  className="bg-black bg-opacity-70 text-white w-6 h-6 flex justify-center items-center rounded-full"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleMediaSelect(index);
                  }}
                >
                  <Edit size={12} />
                </button>
                <button
                  className="bg-black bg-opacity-70 text-white p-1 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeMedia(index);
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <img
              src={slot.url}
              alt={`Preview ${index + 1}`}
              className="w-full h-full object-cover"
            />
            {isEditing && (
              <div className="absolute top-2 right-2 z-10 flex gap-2">
                <button
                  className="bg-black bg-opacity-70 text-white p-1 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeMedia(index);
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  const createEmptyMediaSlots = () => {
    return Array(10)
      .fill(null)
      .map(() => ({
        url: "",
        type: "none",
        cloudUrl: "",
        uploading: false,
      }));
  };

  useEffect(() => {
    if (profileData?.user) {
      const [openingTime = "18:00", closingTime = "03:00"] =
        profileData.user.hoursOfOperation?.split(" - ") || [];

      const formData = {
        venueName: profileData.user.name,
        aboutVenue: profileData.user.description,
        topPerformers: profileData.user.topDragPerformers,
        location: profileData.user.location,
        openingTime: openingTime || "18:00",
        closingTime: closingTime || "03:00",
        venueType: profileData.user.venueType,
        facilities: profileData.user.facilities?.map((f: any) => ({
          value: f,
          label: f.charAt(0).toUpperCase() + f.slice(1).replace("-", " "),
        })),
        facebook: profileData.user.socialMediaLinks?.facebook || "",
        instagram: profileData.user.socialMediaLinks?.instagram || "",
        tiktok: profileData.user.socialMediaLinks?.tiktok || "",
        youtube: profileData.user.socialMediaLinks?.youtube || "",
      };

      if (profileData.user.logo) {
        setLogoUrl(profileData.user.logo);
        setLogoPreview(profileData.user.logo);
      }

      const initialSlots = createEmptyMediaSlots();

      // Create a set to track which slots are already filled
      const filledSlots = new Set();

      // First pass: Load videos (prioritizing videos)
      if (profileData.user.videos && Array.isArray(profileData.user.videos)) {
        profileData.user.videos.forEach((url: any, i: any) => {
          if (url) {
            // Find the first available slot
            let slotIndex = i;

            // If this slot is already beyond our array or we need to find the next available slot
            if (slotIndex >= 10) {
              // Find the first available slot
              for (let j = 0; j < 10; j++) {
                if (!filledSlots.has(j)) {
                  slotIndex = j;
                  break;
                }
              }
            }

            // If we found an available slot within our array (0-9)
            if (slotIndex < 10 && !filledSlots.has(slotIndex)) {
              initialSlots[slotIndex] = {
                url: url,
                type: "video",
                cloudUrl: url,
                uploading: false,
              };
              filledSlots.add(slotIndex);
            }
          }
        });
      }

      // Second pass: Load images (in remaining slots)
      if (profileData.user.images && Array.isArray(profileData.user.images)) {
        profileData.user.images.forEach((url: any, i: any) => {
          if (url) {
            // Find the first available slot
            let slotIndex = i;

            // If this slot is already filled or beyond our array
            if (slotIndex >= 10 || filledSlots.has(slotIndex)) {
              // Find the first available slot
              for (let j = 0; j < 10; j++) {
                if (!filledSlots.has(j)) {
                  slotIndex = j;
                  break;
                }
              }
            }

            // If we found an available slot within our array (0-9)
            if (slotIndex < 10 && !filledSlots.has(slotIndex)) {
              initialSlots[slotIndex] = {
                url: url,
                type: "image",
                cloudUrl: url,
                uploading: false,
              };
              filledSlots.add(slotIndex);
            }
          }
        });
      }

      setMediaSlots(initialSlots);

      reset(formData);
    }
  }, [profileData, reset]);

  const onSubmit = async (data: any) => {
    try {
      const images = mediaSlots
        .filter((slot) => slot.type === "image" && slot.cloudUrl)
        .map((slot) => slot.cloudUrl);

      const videos = mediaSlots
        .filter((slot) => slot.type === "video" && slot.cloudUrl)
        .map((slot) => slot.cloudUrl);

      const transformedData = {
        name: data.venueName,
        description: data.aboutVenue,
        topDragPerformers: data.topPerformers,
        location: data.location,
        hoursOfOperation: `${data.openingTime} - ${data.closingTime}`,
        venueType: data.venueType,
        facilities: data.facilities
          ? data.facilities.map((item: any) => item.value)
          : [],
        logo: logoUrl,
        images,
        videos,
        socialMediaLinks: {
          facebook: data.facebook,
          instagram: data.instagram,
          tiktok: data.tiktok,
          youtube: data.youtube,
        },
      };

      await updateProfile({ data: transformedData }).unwrap();
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile. Please try again.");
    }
  };

  if (isLoading)
    return (
      <div className="flex mt-16 justify-center min-h-screen max-w-[850px]">
        <div className="w-8 h-8 border-4 border-[#FF00A2] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  const inputClass =
    "w-full max-w-[700px] h-[46px] rounded-[16px] bg-[#0D0D0D] text-white px-4 py-2.5 font-['Space_Grotesk'] text-[16px] md:text-[16px] leading-[100%] capitalize placeholder-[#383838] focus:outline-none focus:ring-2 focus:ring-[#FF00A2]";
  const labelClass =
    "block font-['Space_Grotesk'] font-normal text-[14px] md:text-[18px] leading-[100%] capitalize text-white mb-2";

  return (
    <>
      <div
        className="flex justify-end pt-16 max-w-[850px] text-white font-['Space_Grotesk'] font-normal text-[16px] leading-[100%] tracking-[0%] align-middle uppercase items-center gap-2 cursor-pointer"
        onClick={() => setIsEditing(!isEditing)}
      >
        <img src="/profile/edit.svg" alt="Edit" className="w-4 h-4" />
        {isEditing ? "cancel" : "edit"}
      </div>
      <div className="p-4 md:px-8 pb-16 bg-black max-w-[782px]">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 md:space-y-6"
        >
          {/* Venue Name */}
          <div>
            <label className={labelClass}>Venue Name?*</label>
            <input
              type="text"
              placeholder="Enter Venue Name"
              className={inputClass}
              disabled={!isEditing}
              {...register("venueName", { required: true })}
            />
          </div>

          {/* About Venue */}
          <div>
            <label className={labelClass}>Tell Us About Your Venue?*</label>
            <textarea
              placeholder="Enter Venue Description"
              className={`${inputClass} h-[80px] md:h-[130px] resize-none`}
              disabled={!isEditing}
              {...register("aboutVenue", { required: true })}
            />
          </div>

          {/* Top Drag Performers */}
          <div>
            <label className={labelClass}>Top Drag Performers</label>
            <input
              type="text"
              placeholder="Enter Top Drag Performers"
              className={inputClass}
              disabled={!isEditing}
              {...register("topPerformers")}
            />
          </div>

          {/* Location */}
          <div>
            <label className={labelClass}>Location / Address*</label>
            <input
              type="text"
              placeholder="Enter Location / Address"
              className={inputClass}
              disabled={!isEditing}
              {...register("location", { required: true })}
            />
          </div>

          {/* Hours of Operation */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Hours of Operation*</label>
              <div className="relative">
                <input
                  type="time"
                  className={inputClass}
                  disabled={!isEditing}
                  {...register("openingTime", { required: true })}
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <Clock color="white" size={20} />
                </div>
              </div>
            </div>
            <div className="mt-7 relative">
              <input
                type="time"
                className={inputClass}
                disabled={!isEditing}
                {...register("closingTime", { required: true })}
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <Clock color="white" size={20} />
              </div>
            </div>
          </div>

          {/* Type of Venue */}
          <div className="w-full">
            <label className={labelClass}>Type of Venue*</label>

            <Controller
              name="venueType"
              control={control}
              render={({ field }) => (
                <CustomSelect
                  {...field}
                  value={venueOptions.find(
                    (option) => option.value === field.value
                  )}
                  onChange={(selectedOption) =>
                    field.onChange(selectedOption?.value)
                  }
                  options={venueOptions}
                  isDisabled={!isEditing}
                  placeholder="Select Venue Type"
                />
              )}
            />
          </div>

          {/* Facilities & Features */}
          <div>
            <label className={labelClass}>Facilities & Features*</label>
            <Controller
              name="facilities"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select
                  {...field}
                  isMulti
                  isDisabled={!isEditing}
                  closeMenuOnSelect={false}
                  options={[
                    { value: "stage-size", label: "Stage Size & Type" },
                    { value: "seating", label: "Seating Arrangements" },
                    {
                      value: "sound-lighting",
                      label:
                        "Sound & Lighting Equipment (Available In-House Or Need To Rent)",
                    },
                    { value: "backstage", label: "Backstage & Dressing Rooms" },
                    { value: "food-beverages", label: "Food & Beverages" },
                    { value: "parking", label: "Parking Availability" },
                    { value: "others", label: "Others" },
                  ]}
                  className="w-full max-w-[782px]"
                  styles={{
                    control: (base) => ({
                      ...base,
                      minHeight: "46px",
                      background: "#0D0D0D",
                      border: "1px solid #383838",
                      borderRadius: "16px",
                      boxShadow: "none",
                      "&:hover": {
                        border: "1px solid #383838",
                      },
                    }),
                    menu: (base) => ({
                      ...base,
                      background: "#1D1D1D",
                      border: "1px solid #383838",
                      borderRadius: "4px",
                    }),
                    option: (base, state) => ({
                      ...base,
                      background: state.isFocused ? "#383838" : "#1D1D1D",
                      color: "#fff",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      "&::before": {
                        content: '""',
                        display: "block",
                        width: "16px",
                        height: "16px",
                        border: "2px solid #fff",
                        borderRadius: "50%",
                        backgroundColor: state.isSelected
                          ? "#FF00A2"
                          : "transparent",
                      },
                    }),
                    multiValue: (base) => ({
                      ...base,
                      background: "#383838",
                      borderRadius: "4px",
                    }),
                    multiValueLabel: (base) => ({
                      ...base,
                      color: "#fff",
                    }),
                    multiValueRemove: (base) => ({
                      ...base,
                      color: "#fff",
                      ":hover": {
                        background: "#4a4a4a",
                        borderRadius: "0 4px 4px 0",
                      },
                    }),
                    input: (base) => ({
                      ...base,
                      color: "#fff",
                    }),
                  }}
                  placeholder="Select Facilities & Features"
                />
              )}
            />
          </div>

          {/* Social Media Links */}
          <div className="space-y-3 md:space-y-4">
            <h2 className={labelClass}>Add Social Media Link</h2>
            {["Instagram", "Facebook", "TikTok", "YouTube"].map((platform) => (
              <input
                key={platform}
                type="text"
                placeholder={platform.toLowerCase()}
                className={inputClass}
                disabled={!isEditing}
                {...register(platform.toLowerCase())}
              />
            ))}
          </div>

          {/* Upload Logo */}
          <div className="w-full max-w-[782px] bg-black p-4">
            <h2 className="font-['Space_Grotesk'] text-white text-[20px] leading-[100%] mb-4">
              Upload Logo
            </h2>

            <div
              className={`bg-[#0D0D0D] rounded-[16px] px-8 py-3 text-center ${
                isEditing ? "cursor-pointer hover:bg-[#1A1A1A]" : ""
              }`}
              onClick={handleLogoUpload}
            >
              {logoPreview ? (
                <div className="flex flex-col items-center ">
                  <div className="relative ">
                    <img
                      src={logoPreview}
                      alt="Venue Logo"
                      className="w-36 h-36 object-cover mb-4 "
                    />
                    {isEditing && (
                      <button
                        className="absolute top-2 right-2 bg-black bg-opacity-70 text-white p-1 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeLogo();
                        }}
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                  {isEditing && (
                    <p className="text-[#FF00A2]">Click to change logo</p>
                  )}
                </div>
              ) : (
                <>
                  <p className="text-[#3D3D3D] font-['Space_Grotesk'] text-[12px] leading-[100%] tracking-[0%] text-center capitalize mb-2">
                    Please Upload The Venue Logo In PNG Or JPG Format, With A
                    Recommended Size
                  </p>
                  <p className="text-[#3D3D3D] font-['Space_Grotesk'] text-[12px] leading-[100%] tracking-[0%] text-center capitalize mb-4">
                    Of [Specify Dimensions, E.G., 500x500px]
                  </p>
                  <div className="bg-[#FF00A2] text-black rounded-lg px-8 py-1 inline-block font-['Space_Grotesk'] text-[16px] leading-[100%] tracking-[0%] text-center capitalize">
                    Upload
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Upload Images/Video */}
          <div className="max-w-[900px] w-full">
            <h2 className="font-['Space_Grotesk'] text-white font-normal text-[24px] md:text-[36px] leading-[100%] capitalize">
              Upload images/video
            </h2>
            <p className="font-['Space_Grotesk'] mt-4 md:mt-6 text-white font-normal text-[12px] md:text-[13px] leading-[120%] md:leading-[100%] align-middle">
              Upload JPG, PNG, GIF, or MP4. Maximum of 10 photos and video clips
              combined (max 25MB, 1200x800px or larger for images).
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mt-5 md:mt-7">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((index) => (
                <div
                  key={index}
                  onClick={() => isEditing && handleMediaSelect(index)}
                  className={`aspect-square w-full max-w-[214px] bg-[#0D0D0D] rounded-[12px] md:rounded-[16px] overflow-hidden ${
                    isEditing
                      ? "cursor-pointer hover:bg-[#1A1A1A] transition-colors"
                      : "cursor-default"
                  }`}
                >
                  {renderMediaPreview(index)}
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          {isEditing && (
            <div className="flex flex-row gap-3 justify-center mt-6 md:mt-8">
              <button
                type="submit"
                disabled={!isEditing || isUpdating || logoUploading}
                className={`w-full py-2.5 px-6 bg-[#FF00A2] text-white rounded-xl font-semibold transition duration-200 ${
                  (!isEditing || isUpdating || logoUploading) &&
                  "opacity-50 cursor-not-allowed"
                }`}
              >
                {isUpdating || logoUploading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>
                      {isUpdating
                        ? "Publishing..."
                        : logoUploading
                        ? "Uploading logo..."
                        : "Uploading media..."}
                    </span>
                  </div>
                ) : (
                  "Publish/Update"
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </>
  );
};

export default Profile;
