import './App.css'
import './style.css'

function App() {
  return (
    <>
      <div className='flex flex-col md:flex-row h-screen w-screen'>

        <nav className='hidden md:block md:h-screen md:w-[17%] text-white bg-[#00215E]'>
          <div className='flex p-4'>
            <div className='flex flex-row p-4 gap-3'>
              <div className='flex items-center justify-center bg-[#C9A84C] p-4 rounded-lg h-12 w-12'>
                <h1>A</h1>
              </div>
              <div className='flex flex-col'>
                <h1 className='text-md font-bold'>Ateneo</h1>
                <h5 className='text-sm'>Scheduling System</h5>
              </div>
            </div>
          </div>

          <hr />

          <div className='flex flex-col gap-2 p-4 justify-start items-start'>
            <button className='p-3 py-2 w-full text-left rounded-md hover:bg-[#FFFFFF]/13'>
              <h1 className='ml-4'>Dashboard</h1>
            </button>
            <button className='p-3 py-2 w-full text-left rounded-md hover:bg-[#FFFFFF]/13'>
              <h1 className='ml-4'>Generate Schedule</h1>
            </button>
            <button className='p-3 py-2 w-full text-left rounded-md hover:bg-[#FFFFFF]/13'>
              <h1 className='ml-4'>My Schedule</h1>
            </button>
            <button className='p-3 py-2 w-full text-left rounded-md hover:bg-[#FFFFFF]/13'>
              <h1 className='ml-4'>Conflicts</h1>
            </button>
            <button className='p-3 py-2 w-full text-left rounded-md hover:bg-[#FFFFFF]/13'>
              <h1 className='ml-4'>Rooms</h1>
            </button>
            <button className='p-3 py-2 w-full text-left rounded-md hover:bg-[#FFFFFF]/13'>
              <h1 className='ml-4'>Courses</h1>
            </button>
          </div>
        </nav>


        <div className='p-6 md:p-10 md:pt-20 md:pl-20 md:pr-45 w-full overflow-auto'>
          <div className='flex flex-col md:flex-row items-start md:items-end justify-between gap-5 md:gap-0'>
            <div className='flex flex-col gap-5'>
              <h1 className='text-3xl font-bold'>Class Scheduling Dashboard</h1>
              <p className='text-lg mt-4'>Generate, monitor, and resolve class schedules across the semester.</p>
            </div>
            <div>
              <button className='w-full md:w-auto bg-[#00215E] text-white p-3 py-2 rounded-md hover:bg-[#A88A3A]'>
                <h1>Generate Schedule</h1>
              </button>
            </div>
          </div>

          <div className='pt-10 flex flex-col md:flex-row justify-between gap-5 items-stretch md:h-50'>
            <div className='flex flex-col border rounded-xl w-full p-5'>
              <div className='flex flex-col'>
                <div>
                  <h1>TOTAL SCHEDULES</h1>
                </div>
                
                <h1 className='text-[2.5rem]'>0</h1>
              </div>
              
            </div>

            <div className='flex flex-col border rounded-xl w-full p-5'>
              <div className='flex flex-col h-full'>
                <div>
                  <h1>SCHEDULED</h1>
                </div>
                
                <h1 className='text-[2.5rem]'>0</h1>
                <h1>Confirmed & finalized</h1>
              </div>
            </div>

            <div className='flex flex-col border rounded-xl w-full p-5'>
              <div className='flex flex-col h-full'>
                <h1>PENDING</h1>
                <h1 className='text-[2.5rem]'>0</h1>
                <h1>Awaiting assignment</h1>
              </div>
            </div>

            <div className='flex flex-col border rounded-xl w-full p-5'>
              <div className='flex flex-col h-full'>
                <h1>OPEN CONFLICTS</h1>
                <h1 className='text-[2.5rem]'>0</h1>
                <h1>Needs resolution</h1>
              </div>
            </div>
          </div>

          
        </div>
      </div>
    </>
  )
}

export default App
