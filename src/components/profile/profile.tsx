import { Controller, useForm } from "react-hook-form";
import Select from 'react-select';
import { useGetPerformerProfileQuery } from "../../apis/profile";

const Profile = () => {
  const { register, handleSubmit, control } = useForm();
  const { data: performerProfile, isLoading: isLoadingPerformerProfile } = useGetPerformerProfileQuery();

  console.log("performerProfile : ", performerProfile);
  
  const onSubmit = (data: any) => console.log(data);

  // Common input class with responsive width
  const inputClass = "w-full max-w-[782px] h-[46px] rounded-[16px] bg-[#0D0D0D] text-[#383838] px-4 py-2.5 font-['Space_Grotesk'] text-[16px] md:text-[20px] leading-[100%] capitalize placeholder-[#383838] focus:outline-none focus:ring-2 focus:ring-[#FF00A2]";
  
  // Common label class
  const labelClass = "block font-['Space_Grotesk'] font-normal text-[14px] md:text-[20px] leading-[100%] capitalize text-white mb-2";

  return (
    <>
      <div className="flex justify-end pt-16 max-w-[850px] text-white font-['Space_Grotesk'] font-normal text-[16px] leading-[100%] tracking-[0%] align-middle uppercase items-center gap-2">
        <img src="/profile/edit.svg" alt="Edit" className="w-4 h-4" />
        edit
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
              {...register("venueName", { required: true })}
            />
          </div>

          {/* About Venue */}
          <div>
            <label className={labelClass}>Tell Us About Your Venue?*</label>
            <textarea
              placeholder="This Downtown bar transforms into a stage with an electrifying monthly drag brunch show. Those 21 and up can enjoy the performances, along with a brunch buffet, select craft cocktails, and bubbly mimosa flights, plus optional bottle service."
              className={`${inputClass} h-[80px] md:h-[130px] resize-none`}
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
                {...register("openingTime", { required: true })}
              />
            </div>
            <div className="mt-7">
              <input
                type="time"
                className={inputClass}
                {...register("closingTime", { required: true })}
              />
            </div>
          </div>

          {/* Type of Venue */}
          <div>
            <label className={labelClass}>Type of Venue*</label>
            <input
              type="text"
              placeholder="Bar /Club"
              className={inputClass}
              {...register("venueType", { required: true })}
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
                  closeMenuOnSelect={false}
                  options={[
                    { value: "stage-size", label: "Stage Size & Type" },
                    { value: "seating", label: "Seating Arrangements" },
                    { value: "sound-lighting", label: "Sound & Lighting Equipment (Available In-House Or Need To Rent)" },
                    { value: "backstage", label: "Backstage & Dressing Rooms" },
                    { value: "food-beverages", label: "Food & Beverages" },
                    { value: "parking", label: "Parking Availability" },
                    { value: "others", label: "Others" }
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
                        backgroundColor: state.isSelected ? "#FF00A2" : "transparent",
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
            {["Instagram", "Facebook", "TikTok", "Twitter", "YouTube"].map(
              (platform) => (
                <input
                  key={platform}
                  type="text"
                  placeholder={platform.toLowerCase()}
                  className={inputClass}
                  {...register(platform.toLowerCase())}
                />
              )
            )}
          </div>

          <div className="w-full max-w-[782px] bg-black p-4">
      <h2 className="font-['Space_Grotesk'] text-white text-[20px] leading-[100%] mb-4">Upload Logo</h2>
      
      <div className="bg-[#0D0D0D] rounded-[16px] px-8 py-3 text-center">
        <p className="text-[#3D3D3D] font-['Space_Grotesk'] text-[12px] leading-[100%] tracking-[0%] text-center capitalize mb-2">
          Please Upload The Venue Logo In PNG Or JPG Format, With A Recommended Size
        </p>
        <p className="text-[#3D3D3D] font-['Space_Grotesk'] text-[12px] leading-[100%] tracking-[0%] text-center capitalize mb-4">
          Of [Specify Dimensions, E.G., 500x500px]
        </p>
        
        <label htmlFor="logo-upload" className="cursor-pointer">
          <div className="bg-[#FF00A2] text-black rounded-lg px-8 py-1 inline-block font-['Space_Grotesk'] text-[16px] leading-[100%] tracking-[0%] text-center capitalize">
            Upload
          </div>
          <input
            type="file"
            id="logo-upload"
            className="hidden"
            accept=".png,.jpg,.jpeg"
            // onChange={handleFileUpload}
          />
        </label>
      </div>
    </div>

          {/* Buttons */}
          <div className="flex flex-row gap-3 justify-center mt-6 md:mt-8">
            <button
              type="button"
              className="w-[150px] sm:w-[200px] px-4 sm:px-6 md:px-8 py-2 rounded-l-full border border-[#FF00A2] text-[#FF00A2] text-sm md:text-base"
            >
              Preview Profile
            </button>
            <button
              type="submit"
              className="w-[150px] sm:w-[200px] px-4 sm:px-6 md:px-8 py-2 rounded-r-full bg-[#FF00A2] text-white text-sm md:text-base"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default Profile;
