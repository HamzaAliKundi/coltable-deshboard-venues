import React from 'react'

const CreateEvent = () => {
  return (
    <div className="p-4 md:px-8 py-16 bg-black">
      <div className="w-[100px] my-3 h-[4px] rounded-lg bg-[#FF00A2]"></div>
      <h1 className="text-white text-3xl font-space-grotesk mb-8">Event Creation Form</h1>
      
      <form className="flex flex-col gap-6">
        {/* Event Name and Host */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-white font-space-grotesk text-sm md:text-base">
              Event Name
            </label>
            <input 
              type="text"
              placeholder="Event Name..."
              className="w-full h-10 bg-[#0D0D0D] rounded-lg px-3 text-white font-space-grotesk text-base placeholder:text-[#878787] focus:outline-none focus:ring-1 focus:ring-pink-500"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-white font-space-grotesk text-sm md:text-base">
              Event Host
            </label>
            <input 
              type="text"
              placeholder="Event Host Name..."
              className="w-full h-10 bg-[#0D0D0D] rounded-lg px-3 text-white font-space-grotesk text-base placeholder:text-[#878787] focus:outline-none focus:ring-1 focus:ring-pink-500"
            />
          </div>
        </div>

        {/* Event type dropdown */}
        <div className="flex flex-col gap-2">
          <label className="text-white font-space-grotesk text-sm md:text-base">
            Event type
          </label>
          <select 
            className="w-full h-10 bg-[#0D0D0D] rounded-lg px-3 text-white font-space-grotesk text-base focus:outline-none focus:ring-1 focus:ring-pink-500 appearance-none"
          >
            <option value="">Drag show</option>
          </select>
        </div>

        {/* Sound Equipment and Outdoor Venue Questions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-white font-space-grotesk text-sm md:text-base">
              Does the venue have sound equipment for music,microphone,DJ, etc?
            </label>
            <input 
              type="text"
              placeholder="Type ..."
              className="w-full h-10 bg-[#0D0D0D] rounded-lg px-3 text-white font-space-grotesk text-base placeholder:text-[#878787] focus:outline-none focus:ring-1 focus:ring-pink-500"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-white font-space-grotesk text-sm md:text-base">
            If an Outdoor venue, are there awnings/coverings to account for inclement weather conditions?
            </label>
            <input 
              type="text"
              placeholder="Type ..."
              className="w-full h-10 bg-[#0D0D0D] rounded-lg px-3 text-white font-space-grotesk text-base placeholder:text-[#878787] focus:outline-none focus:ring-1 focus:ring-pink-500"
            />
          </div>
        </div>

        {/* Event Type and Theme */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-white font-space-grotesk text-sm md:text-base">
              Event Type
            </label>
            <input 
              type="text"
              placeholder="Event Type ..."
              className="w-full h-10 bg-[#0D0D0D] rounded-lg px-3 text-white font-space-grotesk text-base placeholder:text-[#878787] focus:outline-none focus:ring-1 focus:ring-pink-500"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-white font-space-grotesk text-sm md:text-base">
              Event Theme
            </label>
            <input 
              type="text"
              placeholder="Event Theme..."
              className="w-full h-10 bg-[#0D0D0D] rounded-lg px-3 text-white font-space-grotesk text-base placeholder:text-[#878787] focus:outline-none focus:ring-1 focus:ring-pink-500"
            />
          </div>
        </div>

        {/* Equipment Responsibility */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        

          <div className="flex flex-col gap-2">
            <label className="text-white font-space-grotesk text-sm md:text-base h-10">
              Audience Type
            </label>
            <select 
              className="w-full h-10 bg-[#0D0D0D] rounded-lg px-3 text-white font-space-grotesk text-base focus:outline-none focus:ring-1 focus:ring-pink-500 appearance-none"
            >
              <option value="adults">Adults</option>
              <option value="children">Children</option>
              <option value="all">All Ages</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-white font-space-grotesk text-sm md:text-base h-10">
              Is the Performer responsible for supplying any equipment (i.e. Audio/Visual, microphones, games, bingo cards/setup, etc.)?
            </label>
            <select 
              className="w-full h-10 bg-[#0D0D0D] rounded-lg px-3 text-white font-space-grotesk text-base focus:outline-none focus:ring-1 focus:ring-pink-500 appearance-none"
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
        </div>


        {/* Event Times */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-white font-space-grotesk text-sm md:text-base">
              Event Start Time
            </label>
            <input 
              type="time"
              defaultValue="00:00"
              className="w-full h-10 bg-[#0D0D0D] rounded-lg px-3 text-white font-space-grotesk text-base focus:outline-none focus:ring-1 focus:ring-pink-500"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-white font-space-grotesk text-sm md:text-base">
              Event End Time
            </label>
            <input 
              type="time"
              defaultValue="00:00"
              className="w-full h-10 bg-[#0D0D0D] rounded-lg px-3 text-white font-space-grotesk text-base focus:outline-none focus:ring-1 focus:ring-pink-500"
            />
          </div>
        </div>

          {/* Hosts and Performers Count */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-white font-space-grotesk text-sm md:text-base">
              How many hosts/co-hosts?
            </label>
            <select 
              className="w-full h-10 bg-[#0D0D0D] rounded-lg px-3 text-white font-space-grotesk text-base focus:outline-none focus:ring-1 focus:ring-pink-500 appearance-none"
            >
              <option value="0">0</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5+</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-white font-space-grotesk text-sm md:text-base">
              How many Performers (incl. host) will be part of the event?
            </label>
            <select 
              className="w-full h-10 bg-[#0D0D0D] rounded-lg px-3 text-white font-space-grotesk text-base focus:outline-none focus:ring-1 focus:ring-pink-500 appearance-none"
            >
              <option value="0">0</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5+</option>
            </select>
          </div>
        </div>

        {/* Equipment Responsibility */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        

          <div className="flex flex-col gap-2">
            <label className="text-white font-space-grotesk text-sm md:text-base h-10">
            Event Call Time (the time performers/staff need to be at the venue)
            </label>
            <select 
              className="w-full h-10 bg-[#0D0D0D] rounded-lg px-3 text-white font-space-grotesk text-base focus:outline-none focus:ring-1 focus:ring-pink-500 appearance-none"
            >
              <option value="adults">Adults</option>
              <option value="children">Children</option>
              <option value="all">All Ages</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-white font-space-grotesk text-sm md:text-base h-10">
            How Many numbers will the performer/each performer have?
            </label>
            <select 
              className="w-full h-10 bg-[#0D0D0D] rounded-lg px-3 text-white font-space-grotesk text-base focus:outline-none focus:ring-1 focus:ring-pink-500 appearance-none"
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
        </div>

        {/* Dressing Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-white font-space-grotesk text-sm md:text-base">Is there a Private Dressing area to allow for the performers to change costumes?</label>
            <select className="w-full h-10 bg-[#0D0D0D] rounded-lg px-3 text-white font-space-grotesk text-base focus:outline-none focus:ring-1 focus:ring-pink-500 appearance-none">
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-white font-space-grotesk text-sm md:text-base">What format will the performer need to provide the music/and needed by date/time?</label>
            <input type="time" defaultValue="00:00" className="w-full h-10 bg-[#0D0D0D] rounded-lg px-3 text-white font-space-grotesk text-base focus:outline-none focus:ring-1 focus:ring-pink-500" />
          </div>
        </div>

        {/* Special Requests */}
        <div className="flex flex-col gap-2">
          <label className="text-white font-space-grotesk text-sm md:text-base">
            Any special Requests for the performer?
          </label>
          <textarea 
            placeholder="Type..."
            rows={6}
            className="w-full bg-[#0D0D0D] rounded-lg p-3 text-white font-space-grotesk text-base placeholder:text-[#878787] focus:outline-none focus:ring-1 focus:ring-pink-500"
          />
        </div>

        {/* Submit Button */}
        <button 
          type="submit"
          className="mt-4 bg-[#FF00A2] text-white font-space-grotesk text-base py-2 px-12 rounded-full hover:bg-pink-600 transition-colors w-fit ml-auto"
        >
          SUBMINT
        </button>
      </form>
    </div>
  )
}

export default CreateEvent
