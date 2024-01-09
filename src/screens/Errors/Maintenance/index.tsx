const Maintenance = () => {

  const onClickRefresh =() =>{
    window.location.reload()
  }

  return (
    <div className="mt-5">
      <div className="mt-40">
        <div className="grid grid-cols-1 justify-center items-center mx-5 text-center">
          <h1 className="mt-8 font-bold text-xl leading-6 -tracking-0.04 text-raisin-black">
            Unfortunately, the site is down for a bit of maintenance right now
          </h1>
          <p className="mt-4 tracking-0.08 text-secondary">
            We expect to be back soon. Thanks for your patience
          </p>
          <p className="mt-2 tracking-0.08 text-secondary">
            Please <span onClick={onClickRefresh} className="text-primary underline cursor-pointer">refresh</span> the page
          </p>
        </div>
      </div>
    </div>
  )
}

export default Maintenance