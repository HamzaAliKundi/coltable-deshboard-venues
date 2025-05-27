import { Calendar, ChevronDown, Clock } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import {
  useAddEventByVenueMutation,
  useGetEventsByVenuesByIdQuery,
  useUpdateEventByVenueMutation,
} from "../../../apis/events";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { useGetAllPerformersQuery } from "../../../apis/performer";
import {
  eventOptions,
  equipmentOptions,
  audienceOptions,
  countOptions,
  callTimeOptions,
  dressingAreaOptions,
  outdoorCoveringOptions,
} from "../../../utils/createEvent/dropDownData";
import CustomSelect from "../../../utils/CustomSelect";

type FormData = {
  eventName: string;
  eventHost: string;
  eventType: string;
  soundEquipment?: string;
  outdoorCoverings?: string;
  eventCategory?: string;
  eventTheme?: string;
  audienceType: string;
  equipmentResponsibility: string;
  startTime: string;
  endTime: string;
  eventStartDate: string;
  hostsCount: string;
  performersCount: string;
  callTime: string;
  performerNumbers: string;
  dressingArea: string;
  musicDeadline: string;
  specialRequests?: string;
  logo: string;
  performersList: string[];
  eventDescription: string;
  performerBudget: string;
  hostBudget: string;
  otherStaffBudget: string;
  totalEventBudget: string;
};

const CreateEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [logoPreview, setLogoPreview] = useState("");
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoUrl, setLogoUrl] = useState("");

  const [addEventByVenue, { isLoading: createEventLoading }] =
    useAddEventByVenueMutation();
  const [updateEventByVenue, { isLoading: updateEventLoading }] =
    useUpdateEventByVenueMutation();
  const { data: getEventsByVenuesById, isLoading: getEventLoading } =
    useGetEventsByVenuesByIdQuery(id, {
      skip: !id,
    });

  const { data: performersData } = useGetAllPerformersQuery();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    watch,
    control,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      isPrivate: false,
    },
  });

  const handleLogoUpload = async () => {
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

  useEffect(() => {
    if (id && getEventsByVenuesById?.event) {
      reset({
        eventType: getEventsByVenuesById.event.type || "",

        startTime: getEventsByVenuesById.event.startTime
          ? new Date(getEventsByVenuesById.event.startTime)
              .toTimeString()
              .slice(0, 5)
          : undefined,
        endTime: getEventsByVenuesById.event.endTime
          ? new Date(getEventsByVenuesById.event.endTime)
              .toTimeString()
              .slice(0, 5)
          : undefined,

        callTime: getEventsByVenuesById.event.eventCallTime
          ? new Date(getEventsByVenuesById.event.eventCallTime)
              .toTimeString()
              .slice(0, 5)
          : undefined,

        eventStartDate: getEventsByVenuesById?.event?.startDate
          ? new Date(getEventsByVenuesById.event.startDate)
              .toISOString()
              .split("T")[0]
          : undefined,

        eventName: getEventsByVenuesById.event.title || "",
        eventHost: getEventsByVenuesById.event.host || "",
        audienceType: getEventsByVenuesById.event.audienceType,
        musicDeadline: getEventsByVenuesById.event.musicFormat || undefined,
        equipmentResponsibility:
          getEventsByVenuesById.event.isEquipmentProvidedByPerformer || "",

        hostsCount: String(getEventsByVenuesById.event.hosts || ""),
        performersCount: String(getEventsByVenuesById.event.performers || ""),

        dressingArea: getEventsByVenuesById.event.hasPrivateDressingArea || "",
        specialRequests: getEventsByVenuesById.event.specialRequirements || "",
        outdoorCoverings: getEventsByVenuesById.event.hasCoverings || "",
        soundEquipment:
          getEventsByVenuesById.event.isEquipmentProvidedByVenue || "",
        performerNumbers: String(
          getEventsByVenuesById.event.assignedPerformers || ""
        ),
        eventCategory: getEventsByVenuesById.event.eventCategory || "",
        performersList: getEventsByVenuesById.event.performersList.map(
          (p: any) => p._id
        ),

        eventDescription: getEventsByVenuesById.event.description || "",
        totalEventBudget: getEventsByVenuesById.event.totalEventBudget || "",
        otherStaffBudget: getEventsByVenuesById.event.otherStaffBudget || "",
        hostBudget: getEventsByVenuesById.event.hostBudget || "",
        performerBudget: getEventsByVenuesById.event.performerBudget || "",
      });

      if (getEventsByVenuesById?.event?.image) {
        setLogoUrl(getEventsByVenuesById.event.image);
        setLogoPreview(getEventsByVenuesById.event.image);
      }
    }
  }, [id, getEventsByVenuesById, reset]);

  const onSubmit = async (data: FormData) => {
    if (!logoUrl.trim()) {
      return;
    }
    const today = new Date().toISOString().split("T")[0];

    const transformedData = {
      startTime: new Date(`${today}T${data.startTime}`),
      endTime: new Date(`${today}T${data.endTime}`),
      eventCallTime: new Date(`${today}T${data.callTime}`),

      type: data.eventType,
      title: data.eventName,
      host: data.eventHost,
      specialRequirements: data.specialRequests,
      audienceType: data.audienceType,
      hosts: data.hostsCount,
      hasCoverings: data.outdoorCoverings,
      hasPrivateDressingArea: data.dressingArea,
      isEquipmentProvidedByVenue: data.soundEquipment,
      isEquipmentProvidedByPerformer: data.equipmentResponsibility,
      performers: data.performersCount,
      performersList: data.performersList,
      startDate: data.eventStartDate,
      musicFormat: data.musicDeadline,
      assignedPerformers: data.performerNumbers,
      image: logoUrl,
      eventCategory: data.eventCategory,
      description: data.eventDescription,
      performerBudget: data.performerBudget,
      hostBudget: data.hostBudget,
      otherStaffBudget: data.otherStaffBudget,
      totalEventBudget: data.totalEventBudget,
    };

    try {
      if (id) {
        await updateEventByVenue({
          id,
          eventData: transformedData,
        }).unwrap();
        toast.success("Event updated successfully!");
      } else {
        await addEventByVenue(transformedData).unwrap();
        toast.success("Event created successfully!");
      }
      navigate("/events");
    } catch (error) {
      console.error("Error saving event:", error);
      toast.error(
        `Failed to ${id ? "update" : "create"} event. Please try again.`
      );
    }
  };

  const inputClass =
    "w-full max-w-[700px] h-[46px] rounded-[16px] bg-[#0D0D0D] text-[#383838] px-4 py-2.5 font-['Space_Grotesk'] text-[16px] md:text-[16px] leading-[100%] capitalize placeholder-[#383838] focus:outline-none focus:ring-2 focus:ring-[#FF00A2]";
  const labelClass =
    "block font-['Space_Grotesk'] font-normal text-[14px] md:text-[16px] leading-[100%] capitalize text-white mb-2";

  const isSubmitting =
    createEventLoading || updateEventLoading || logoUploading;

  if (getEventLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="w-8 h-8 border-2 border-[#FF00A2] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:px-8 py-16 bg-black">
      <div className="w-[100px] my-3 h-[4px] rounded-lg bg-[#FF00A2]"></div>
      <h1 className="text-white text-3xl font-space-grotesk mb-8">
        Event Creation Form
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        {/* Event Name and Host */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-white font-space-grotesk text-sm md:text-base">
              Event Name*
            </label>
            <input
              type="text"
              placeholder="Event Name"
              className="w-full h-12 bg-[#0D0D0D] rounded-lg px-3 text-white font-space-grotesk text-base placeholder:text-[#878787] focus:outline-none focus:ring-1 focus:ring-pink-500"
              {...register("eventName", { required: "Event name is required" })}
            />
            {errors.eventName && (
              <span className="text-red-500 text-sm">
                {errors.eventName.message}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-white font-space-grotesk text-sm md:text-base">
              Event Host*
            </label>
            <input
              type="text"
              placeholder="Event Host Name"
              className="w-full h-12 bg-[#0D0D0D] rounded-lg px-3 text-white font-space-grotesk text-base placeholder:text-[#878787] focus:outline-none focus:ring-1 focus:ring-pink-500"
              {...register("eventHost", { required: "Event host is required" })}
            />
            {errors.eventHost && (
              <span className="text-red-500 text-sm">
                {errors.eventHost.message}
              </span>
            )}
          </div>
        </div>

        {/* Event type dropdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-white font-space-grotesk text-sm md:text-base">
              Event Category*
            </label>
            <input
              type="text"
              placeholder="Event Category"
              className="w-full h-12 bg-[#0D0D0D] rounded-lg px-3 text-white font-space-grotesk text-base placeholder:text-[#878787] focus:outline-none focus:ring-1 focus:ring-pink-500"
              {...register("eventCategory", {
                required: "Event category information is required",
              })}
            />
            {errors.eventCategory && (
              <span className="text-red-500 text-sm">
                {errors.eventCategory.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-white font-space-grotesk text-sm md:text-base">
              Event type*
            </label>
            <Controller
              name="eventType"
              control={control}
              rules={{ required: "Event type is required" }}
              render={({ field }) => (
                <CustomSelect
                  {...field}
                  value={eventOptions.find(
                    (option) => option.value === field.value
                  )}
                  onChange={(selectedOption: any) =>
                    field.onChange(selectedOption?.value)
                  }
                  options={eventOptions}
                  isDisabled={false}
                  placeholder="Select event type"
                />
              )}
            />
            {errors.eventType && (
              <span className="text-red-500 text-sm">
                {errors.eventType.message}
              </span>
            )}
          </div>
        </div>

        {/* Sound Equipment and Outdoor Venue Questions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2 self-end">
            <label className="text-white font-space-grotesk text-sm md:text-base">
              Does the venue have sound equipment for music,microphone,DJ, etc?*
            </label>
            <input
              type="text"
              placeholder="Enter here"
              className="w-full h-12 bg-[#0D0D0D] rounded-lg px-3 text-white font-space-grotesk text-base placeholder:text-[#878787] focus:outline-none focus:ring-1 focus:ring-pink-500"
              {...register("soundEquipment", {
                required: "Equipment information is required",
              })}
            />
            {errors.soundEquipment && (
              <span className="text-red-500 text-sm">
                {errors.soundEquipment.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2 self-end">
            <label className="text-white font-space-grotesk text-sm md:text-base">
              If an Outdoor venue, are there awnings/coverings to account for
              inclement weather conditions?*
            </label>
            <Controller
              name="outdoorCoverings"
              control={control}
              rules={{ required: "Field is required" }}
              render={({ field }) => (
                <CustomSelect
                  {...field}
                  value={outdoorCoveringOptions.find(
                    (option) => option.value === field.value
                  )}
                  onChange={(selectedOption) =>
                    field.onChange(selectedOption?.value)
                  }
                  options={outdoorCoveringOptions}
                  isDisabled={false}
                  placeholder="Enter here"
                />
              )}
            />
            {errors.outdoorCoverings && (
              <span className="text-red-500 text-sm">
                {errors.outdoorCoverings.message}
              </span>
            )}
          </div>
        </div>

        {/* Equipment Responsibility */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Audience Type */}
          <div className="flex flex-col gap-2 self-end">
            <label className="text-white font-space-grotesk text-sm md:text-base">
              Audience Type*
            </label>
            <Controller
              name="audienceType"
              control={control}
              rules={{ required: "Audience type is required" }}
              render={({ field }) => (
                <CustomSelect
                  {...field}
                  value={audienceOptions.find(
                    (option) => option.value === field.value
                  )}
                  onChange={(selectedOption) =>
                    field.onChange(selectedOption?.value)
                  }
                  options={audienceOptions}
                  isDisabled={false}
                  placeholder="Select audience type"
                />
              )}
            />
            {errors.audienceType && (
              <span className="text-red-500 text-sm">
                {errors.audienceType.message}
              </span>
            )}
          </div>

          {/* Equipment Responsibility */}
          <div className="flex flex-col gap-2">
            <label className="text-white font-space-grotesk text-sm md:text-base">
              Is the Performer responsible for supplying any equipment (i.e.
              Audio/Visual, microphones, games, bingo cards/setup, etc.)?*
            </label>
            <Controller
              name="equipmentResponsibility"
              control={control}
              rules={{ required: "This field is required" }}
              render={({ field }) => (
                <CustomSelect
                  {...field}
                  value={equipmentOptions.find(
                    (option) => option.value === field.value
                  )}
                  onChange={(selectedOption) =>
                    field.onChange(selectedOption?.value)
                  }
                  options={equipmentOptions}
                  isDisabled={false}
                  placeholder="Select"
                />
              )}
            />
            {errors.equipmentResponsibility && (
              <span className="text-red-500 text-sm">
                {errors.equipmentResponsibility.message}
              </span>
            )}
          </div>
        </div>

        {/* Event Times */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className={labelClass}>Event Start Time*</label>

            <div className="relative">
              <input
                type="time"
                className={`${inputClass} text-white `}
                {...register("startTime", {
                  required: "Start time is required",
                })}
              />

              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <Clock color="white" size={20} />
              </div>
            </div>
            {errors.startTime && (
              <p className="text-red-500 text-sm mt-1">
                {errors.startTime.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className={labelClass}>Event End Time*</label>
            <div className="relative">
              <input
                type="time"
                className={`${inputClass} text-white `}
                {...register("endTime", {
                  required: "End time is required",
                })}
              />

              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <Clock color="white" size={20} />
              </div>
            </div>
            {errors.endTime && (
              <p className="text-red-500 text-sm mt-1">
                {errors.endTime.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-white font-space-grotesk text-sm md:text-base">
            Event Start Date*
          </label>
          <div className="relative">
            <input
              type="date"
              className="w-full h-12 bg-[#0D0D0D] rounded-lg px-3 text-white font-space-grotesk text-base focus:outline-none focus:ring-1 focus:ring-pink-500"
              {...register("eventStartDate", {
                required: "Start date is required",
              })}
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <Calendar color="white" size={20} />
            </div>
          </div>

          {errors.eventStartDate && (
            <span className="text-red-500 text-sm">
              {errors.eventStartDate.message}
            </span>
          )}
        </div>

        {/* Hosts and Performers Count */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Hosts Count */}
          <div className="flex flex-col gap-2 justify-end">
            <label className="text-white font-space-grotesk text-sm md:text-base">
              How many hosts/co-hosts?*
            </label>
            <input
              type="number"
              min="0"
              onWheel={(e) => (e.target as HTMLInputElement).blur()}
              placeholder="Event Host Count"
              className="w-full h-12 bg-[#0D0D0D] rounded-lg px-3 text-white font-space-grotesk text-base placeholder:text-[#878787] focus:outline-none focus:ring-1 focus:ring-pink-500 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              {...register("hostsCount", {
                required: "Host count is required",
                min: {
                  value: 0,
                  message: "Negative numbers are not allowed",
                },
                valueAsNumber: true,
              })}
            />
            {errors.hostsCount && (
              <span className="text-red-500 text-sm">
                {errors.hostsCount.message}
              </span>
            )}
          </div>

          {/* Performers Count */}
          <div className="flex flex-col gap-2">
            <label className="text-white font-space-grotesk text-sm md:text-base">
              How many Performers (incl. host) will be part of the event?*
            </label>
            <Controller
              name="performersCount"
              control={control}
              rules={{
                required: "Performers count is required",
                min: { value: 0, message: "Negative numbers are not allowed" },
              }}
              render={({ field }) => (
                <input
                  type="number"
                  min="0"
                  onWheel={(e) => (e.target as HTMLInputElement).blur()}
                  placeholder="Performers Count"
                  className="w-full h-12 bg-[#0D0D0D] rounded-lg px-3 text-white font-space-grotesk text-base placeholder:text-[#878787] focus:outline-none focus:ring-1 focus:ring-pink-500 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  {...field}
                  value={field.value ?? ""}
                />
              )}
            />
            {errors.performersCount && (
              <span className="text-red-500 text-sm">
                {errors.performersCount.message}
              </span>
            )}
          </div>
        </div>

        {/* Equipment Responsibility */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Event Call Time */}

          <div className="flex flex-col gap-2 justify-end">
            <label className={labelClass}>Event Call Time*</label>

            <div className="relative">
              <input
                type="time"
                className={`${inputClass} text-white `}
                {...register("callTime", {
                  required: "Call time is required",
                })}
              />

              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <Clock color="white" size={20} />
              </div>
            </div>
            {errors.callTime && (
              <p className="text-red-500 text-sm mt-1">
                {errors.callTime.message}
              </p>
            )}
          </div>

          {/* Performer Numbers */}
          <div className="flex flex-col gap-2">
            <label className="text-white font-space-grotesk text-sm md:text-base">
              How Many numbers will the performer/each performer have?*
            </label>
            <Controller
              name="performerNumbers"
              control={control}
              rules={{
                required: "This field is required",
                min: { value: 0, message: "Negative numbers are not allowed" },
              }}
              render={({ field }) => (
                <input
                  type="number"
                  min="0"
                  onWheel={(e) => (e.target as HTMLInputElement).blur()}
                  placeholder="Enter Number"
                  className="w-full h-12 bg-[#0D0D0D] rounded-lg px-3 text-white font-space-grotesk text-base placeholder:text-[#878787] focus:outline-none focus:ring-1 focus:ring-pink-500 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  {...field}
                  value={field.value ?? ""}
                />
              )}
            />
            {errors.performerNumbers && (
              <span className="text-red-500 text-sm">
                {errors.performerNumbers.message}
              </span>
            )}
          </div>
        </div>

        {/* Dressing Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-white font-space-grotesk text-sm md:text-base">
              Is there a Private Dressing area to allow for the performers to
              change costumes?*
            </label>
            <Controller
              name="dressingArea"
              control={control}
              rules={{ required: "This field is required" }}
              render={({ field }) => (
                <CustomSelect
                  {...field}
                  value={dressingAreaOptions.find(
                    (option: any) => option.value === field.value
                  )}
                  onChange={(selectedOption) =>
                    field.onChange(selectedOption?.value)
                  }
                  options={dressingAreaOptions}
                  isDisabled={false}
                  placeholder="Select"
                />
              )}
            />
            {errors.dressingArea && (
              <span className="text-red-500 text-sm">
                {errors.dressingArea.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-white font-space-grotesk text-sm md:text-base">
              What format will the performer need to provide the music/and
              needed by date/time?*
            </label>
            <input
              type="text"
              placeholder="Enter here"
              className="w-full h-12 bg-[#0D0D0D] rounded-lg px-3 text-white font-space-grotesk text-base placeholder:text-[#878787] focus:outline-none focus:ring-1 focus:ring-pink-500"
              {...register("musicDeadline", { required: "Field is required" })}
            />
            {errors.musicDeadline && (
              <span className="text-red-500 text-sm">
                {errors.musicDeadline.message}
              </span>
            )}
          </div>
        </div>

        {/* Special Requests */}
        <div className="flex flex-col gap-2">
          <label className="text-white font-space-grotesk text-sm md:text-base">
            Notes for the performers, including booking fee information, etc.
          </label>
          <textarea
            placeholder="Type..."
            rows={6}
            className="w-full bg-[#0D0D0D] rounded-lg p-3 text-white font-space-grotesk text-base placeholder:text-[#878787] focus:outline-none focus:ring-1 focus:ring-pink-500"
            {...register("specialRequests")}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-white font-space-grotesk text-sm md:text-base">
            Event Description (describe the event for the Public as this will be
            on the public events calendar description)*
          </label>
          <textarea
            placeholder="Type..."
            rows={6}
            className="w-full bg-[#0D0D0D] rounded-lg p-3 text-white font-space-grotesk text-base placeholder:text-[#878787] focus:outline-none focus:ring-1 focus:ring-pink-500"
            {...register("eventDescription", { required: "Field is required" })}
          />
          {errors.eventDescription && (
            <span className="text-red-500 text-sm">
              {errors.eventDescription.message}
            </span>
          )}
        </div>

        {/* Logo Upload */}
        <div className="w-full max-w-[782px] self-center bg-black p-4">
          <h2 className="font-['Space_Grotesk'] text-white text-[20px] leading-[100%] mb-4">
            Upload Event Flier <span className="text-[#FF00A2]">*</span>
          </h2>

          <div
            className="bg-[#0D0D0D] rounded-[16px] px-8 py-3 text-center 
               cursor-pointer"
            onClick={handleLogoUpload}
          >
            {logoPreview ? (
              <div className="flex flex-col items-center">
                <img
                  src={logoPreview}
                  alt="Venue Logo"
                  className="w-32 h-32 object-contain mb-4"
                />
                <p className="text-[#FF00A2]">Click to Update Flier</p>
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
                <div className="bg-[#FF00A2] text-black rounded-lg px-8 py-3 inline-block font-['Space_Grotesk'] text-[16px] leading-[100%] tracking-[0%] text-center capitalize">
                  Upload Event Flier
                </div>
              </>
            )}
          </div>
          {!logoUrl.trim() && (
            <span className="text-red-500 text-sm">
              Event flier is required
            </span>
          )}
        </div>

        {/* Book Performer */}
        <div>
          <div className="w-[100px] my-3 h-[4px] rounded-lg bg-[#FF00A2]"></div>
          <h1 className="text-white text-3xl font-space-grotesk mb-8">
            Book Performer
          </h1>
          <div className="flex flex-col gap-4">
            {/* Performers List */}
            <div>
              <label className={labelClass}>Select Performer*</label>
              <Controller
                name="performersList"
                control={control}
                defaultValue={[]}
                rules={{ required: true }}
                render={({ field }) => {
                  const selectedOptions =
                    performersData
                      ?.filter((performer: any) =>
                        field.value?.includes(performer._id)
                      )
                      ?.map((performer: any) => ({
                        value: performer._id,
                        label: performer.fullDragName || "Unnamed Performer",
                      })) || [];

                  return (
                    <Select
                      value={selectedOptions}
                      onChange={(options) => {
                        const selectedIds =
                          options?.map((option) => option.value) || [];
                        field.onChange(selectedIds);
                      }}
                      isMulti
                      closeMenuOnSelect={false}
                      options={performersData?.map((performer: any) => ({
                        value: performer._id,
                        label: performer.fullDragName || "Unnamed Performer",
                      }))}
                      className="w-full"
                      styles={{
                        control: (base) => ({
                          ...base,
                          minHeight: "50px",
                          background: "#0D0D0D",
                          border: "0px solid transparent",
                          borderRadius: "8px",
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
                      placeholder="Performers name"
                      noOptionsMessage={() => "No performers available"}
                    />
                  );
                }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-white font-space-grotesk text-sm md:text-base">
                  Host Budget*
                </label>
                <input
                  type="text"
                  placeholder="Amount"
                  className="w-full h-12 bg-[#0D0D0D] rounded-lg px-3 text-white font-space-grotesk text-base placeholder:text-[#878787] focus:outline-none focus:ring-1 focus:ring-pink-500"
                  {...register("hostBudget", {
                    required: "Host Budget is required",
                  })}
                />
                {errors.hostBudget && (
                  <span className="text-red-500 text-sm">
                    {errors.hostBudget.message}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-white font-space-grotesk text-sm md:text-base">
                  Performer Budget*
                </label>
                <input
                  type="text"
                  placeholder="Amount"
                  className="w-full h-12 bg-[#0D0D0D] rounded-lg px-3 text-white font-space-grotesk text-base placeholder:text-[#878787] focus:outline-none focus:ring-1 focus:ring-pink-500"
                  {...register("performerBudget", {
                    required: "Performer Budget is required",
                  })}
                />
                {errors.performerBudget && (
                  <span className="text-red-500 text-sm">
                    {errors.performerBudget.message}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-white font-space-grotesk text-sm md:text-base">
                  Other staff budget, if any
                </label>
                <input
                  type="text"
                  placeholder="Amount"
                  className="w-full h-12 bg-[#0D0D0D] rounded-lg px-3 text-white font-space-grotesk text-base placeholder:text-[#878787] focus:outline-none focus:ring-1 focus:ring-pink-500"
                  {...register("otherStaffBudget")}
                />
                {errors.otherStaffBudget && (
                  <span className="text-red-500 text-sm">
                    {errors.otherStaffBudget.message}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-white font-space-grotesk text-sm md:text-base">
                  Total Event Budget*
                </label>
                <input
                  type="text"
                  placeholder="Amount"
                  className="w-full h-12 bg-[#0D0D0D] rounded-lg px-3 text-white font-space-grotesk text-base placeholder:text-[#878787] focus:outline-none focus:ring-1 focus:ring-pink-500"
                  {...register("totalEventBudget")}
                />
                {errors.totalEventBudget && (
                  <span className="text-red-500 text-sm">
                    {errors.totalEventBudget.message}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className={`mt-4 bg-[#FF00A2] text-white font-space-grotesk text-base py-2 px-12 rounded-full hover:bg-pink-600 transition-colors w-fit ml-auto 
            ${isSubmitting ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
            `}
        >
          {isSubmitting ? (
            <div className="flex justify-center px-[17px]">
              <div className="w-6 h-6 border-2 border-[#eeeaed] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : id ? (
            "UPDATE"
          ) : (
            "SUBMIT"
          )}
        </button>
      </form>
    </div>
  );
};

export default CreateEvent;
