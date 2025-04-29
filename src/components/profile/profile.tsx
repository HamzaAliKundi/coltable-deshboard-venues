import { Controller, useForm } from "react-hook-form";
import Select from "react-select";
import {
  useGetSingleVenueByIdQuery,
  useUpdateVenueProfileMutation,
} from "../../apis/venues";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
// import { v2 as cloudinary } from "cloudinary";

interface MediaItem {
  url: string;
  type: "image" | "video";
}

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [mediaUrls, setMediaUrls] = useState<(MediaItem | string)[]>(Array(10).fill(""));
  const [logoUrl, setLogoUrl] = useState("");
  const [logoPreview, setLogoPreview] = useState("");
  const { register, handleSubmit, control, reset } = useForm();
  const venueId = JSON.parse(localStorage.getItem("venueId") || '""');
  const [logoUploading, setLogoUploading] = useState(false);
  const [images, setImages] = useState<string[]>(Array(10).fill(""));
  const [videos, setVideos] = useState<string[]>(Array(10).fill(""));
  const [mediaPreviews, setMediaPreviews] = useState<(MediaItem | string)[]>(Array(4).fill(""));

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
        try {
          setLogoUploading(true);
          // First show preview
          const reader = new FileReader();
          reader.onload = () => {
            setLogoPreview(reader.result as string);
          };
          reader.readAsDataURL(file);

          // Create timestamp for signature
          const timestamp = Math.round(new Date().getTime() / 1000).toString();

          // Create the string to sign
          const str_to_sign = `timestamp=${timestamp}${
            import.meta.env.VITE_CLOUDINARY_API_SECRET
          }`;

          // Generate SHA-1 signature
          const signature = await generateSHA1(str_to_sign);

          // Upload to Cloudinary using signed upload
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
          setLogoUploading(false); // Upload complete
        }
      }
    };

    input.click();
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

  const handleMediaSelect = async (index: number) => {
    if (!isEditing) return;

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg,image/png,image/gif,video/mp4,video/quicktime";
    input.multiple = false;

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        // First show preview
        const previewUrl = URL.createObjectURL(file);
        const isVideo = file.type.startsWith("video/");

        const newPreviews = [...mediaPreviews];
        newPreviews[index] = isVideo
          ? { url: previewUrl, type: "video" }
          : previewUrl;
        setMediaPreviews(newPreviews);

        // Create timestamp for signature
        const timestamp = Math.round(new Date().getTime() / 1000).toString();

        // Create the string to sign
        const str_to_sign = `timestamp=${timestamp}${
          import.meta.env.VITE_CLOUDINARY_API_SECRET
        }`;

        // Generate SHA-1 signature
        const signature = await generateSHA1(str_to_sign);

        // Upload to Cloudinary using signed upload
        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", import.meta.env.VITE_CLOUDINARY_API_KEY);
        formData.append("timestamp", timestamp);
        formData.append("signature", signature);

        // Use different upload endpoints for images vs videos
        const resourceType = isVideo ? "video" : "image";
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${
            import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
          }/${resourceType}/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const data = await response.json();

        // Store the Cloudinary URL with type info
        if (resourceType === "image") {
          const newImages = [...images];
          newImages[index] = data.secure_url;
          setImages(newImages);
        } else {
          const newVideos = [...videos];
          newVideos[index] = data.secure_url;
          setVideos(newVideos);
        }

        toast.success(
          `${
            resourceType === "image" ? "Image" : "Video"
          } uploaded successfully!`
        );
      } catch (error) {
        console.error("Failed to upload media:", error);
        toast.error("Failed to upload media. Please try again.");

        // Reset preview on error
        const newPreviews = [...mediaPreviews];
        newPreviews[index] = "";
        setMediaPreviews(newPreviews);
      }
    };

    input.click();
  };

  // Render media preview
  const renderMediaPreview = (media: MediaItem | string, index: number) => {
    if (!media) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-[#383838] text-2xl md:text-3xl">+</span>
        </div>
      );
    }

    const isVideo = typeof media === "object" && media.type === "video";
    const isImage =
      typeof media === "string" ||
      (typeof media === "object" && media.type === "image");
    const url = typeof media === "string" ? media : media.url;

    return (
      <div className="w-full h-full relative">
        {isVideo ? (
          <div className="relative w-full h-full">
            <video
              className="w-full h-full object-cover"
              src={url}
              controls
              controlsList="nodownload noremoteplayback noplaybackrate"
              onClick={(e) => e.stopPropagation()}
            />
            {isEditing && (
              <button
                className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMediaSelect(index);
                }}
              >
                Change
              </button>
            )}
          </div>
        ) : (
          <>
            <img
              src={url}
              alt={`Preview ${index + 1}`}
              className="w-full h-full object-cover"
            />
            {isEditing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity">
                <span className="text-white text-lg">Click to change</span>
              </div>
            )}
          </>
        )}
      </div>
    );
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
        openingTime: openingTime || "18:00", // 06:00 PM
        closingTime: closingTime || "03:00", // 03:00 AM
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

      // Set images and videos from user data
      if (profileData.user.images) {
        const imagePreviews = profileData.user.images.map((url: string) => url);
        setImages(imagePreviews);
        setMediaPreviews(imagePreviews);
      }
      
      if (profileData.user.videos) {
        const videoPreviews = profileData.user.videos.map((url: string) => ({ url, type: "video" }));
        setVideos(profileData.user.videos);
        setMediaPreviews(prev => [...prev, ...videoPreviews]);
      }

      reset(formData);
    }
  }, [profileData, reset]);

  const onSubmit = async (data: any) => {
    try {
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
        images: images.filter((url) => url !== ""),
        videos: videos.filter((url) => url !== ""),
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
    "w-full max-w-[782px] h-[46px] rounded-[16px] bg-[#0D0D0D] text-[#383838] px-4 py-2.5 font-['Space_Grotesk'] text-[16px] md:text-[20px] leading-[100%] capitalize placeholder-[#383838] focus:outline-none focus:ring-2 focus:ring-[#FF00A2]";
  const labelClass =
    "block font-['Space_Grotesk'] font-normal text-[14px] md:text-[20px] leading-[100%] capitalize text-white mb-2";

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
              placeholder="Chapman & Kirby"
              className={inputClass}
              disabled={!isEditing}
              {...register("venueName", { required: true })}
            />
          </div>

          {/* About Venue */}
          <div>
            <label className={labelClass}>Tell Us About Your Venue?*</label>
            <textarea
              placeholder="This Downtown bar transforms into a stage with an electrifying monthly drag brunch show. Those 21 and up can enjoy the performances, along with a brunch buffet, select craft cocktails, and bubbly mimosa flights, plus optional bottle service."
              className={`${inputClass} h-[80px] md:h-[130px] resize-none`}
              disabled={!isEditing}
              {...register("aboutVenue", { required: true })}
            />
          </div>

          {/* Top Drag Performers */}
          <div>
            <label className={labelClass}>Top Drag Performers*</label>
            <input
              type="text"
              placeholder="Performer"
              className={inputClass}
              disabled={!isEditing}
              {...register("topPerformers", { required: true })}
            />
          </div>

          {/* Location */}
          <div>
            <label className={labelClass}>Location / Address*</label>
            <input
              type="text"
              placeholder="2118 Lamar St #100, Houston, TX 77003"
              className={inputClass}
              disabled={!isEditing}
              {...register("location", { required: true })}
            />
          </div>

          {/* Hours of Operation */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Hours of Operation*</label>
              <input
                type="time"
                className={inputClass}
                disabled={!isEditing}
                {...register("openingTime", { required: true })}
              />
            </div>
            <div className="mt-7">
              <input
                type="time"
                className={inputClass}
                disabled={!isEditing}
                {...register("closingTime", { required: true })}
              />
            </div>
          </div>

          {/* Type of Venue */}
          <div>
            <label className={labelClass}>Type of Venue*</label>
            <Controller
              name="venueType"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <select {...field} disabled={!isEditing} className={inputClass}>
                  <option value="">Select venue type</option>
                  <option value="Bar/Club">Bar/Club</option>
                  <option value="Restaurants/Dining">Restaurants/Dining</option>
                  <option value="Other">Other</option>
                </select>
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
                  placeholder="Select facilities and features"
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
                <div className="flex flex-col items-center">
                  <img
                    src={logoPreview}
                    alt="Venue Logo"
                    className="w-32 h-32 object-contain mb-4"
                  />
                  <p className="text-[#FF00A2]">Click to change logo</p>
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
              Upload JPG, PNG, GIF, or MP4. Maximum 10 photos & 10 video clips
              (max 25MB, 1200x800px or larger for images).
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mt-5 md:mt-7">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((index) => (
                <div
                  key={index}
                  onClick={() => handleMediaSelect(index)}
                  className={`aspect-square w-full max-w-[214px] bg-[#0D0D0D] rounded-[12px] md:rounded-[16px] overflow-hidden ${
                    isEditing
                      ? "cursor-pointer hover:bg-[#1A1A1A] transition-colors"
                      : "cursor-default"
                  }`}
                >
                  {renderMediaPreview(mediaPreviews[index], index)}
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
                {isUpdating ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Publishing...</span>
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
