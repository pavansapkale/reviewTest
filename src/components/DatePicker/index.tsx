import WheelPicker from "../../lib/WheelPicker"
import { useEffect, useState } from "react"
interface Props {
  showDatePicker: boolean
  confirmButtonClicked: boolean
  setDateOfBirth: any,
  minYear?: number
}
const DatePicker = ({
  setDateOfBirth,
  showDatePicker,
  confirmButtonClicked,
  minYear = 0
}: Props) => {
  useEffect(() => {
    if (confirmButtonClicked) {
      dateHandler()
    }
  }, [showDatePicker])
  const currentYear = new Date().getFullYear()
  const months = [
    { id: "1", value: "January" },
    { id: "2", value: "February" },
    { id: "3", value: "March" },
    { id: "4", value: "April" },
    { id: "5", value: "May" },
    { id: "6", value: "June" },
    { id: "7", value: "July" },
    { id: "8", value: "August" },
    { id: "9", value: "September" },
    { id: "10", value: "October" },
    { id: "11", value: "November" },
    { id: "12", value: "December" },
  ]
  const defaultDays = [
    { id: "1", value: "1" },
    { id: "2", value: "2" },
    { id: "3", value: "3" },
    { id: "4", value: "4" },
    { id: "5", value: "5" },
    { id: "6", value: "6" },
    { id: "7", value: "7" },
    { id: "8", value: "8" },
    { id: "9", value: "9" },
    { id: "10", value: "10" },
    { id: "11", value: "11" },
    { id: "12", value: "12" },
    { id: "13", value: "13" },
    { id: "14", value: "14" },
    { id: "15", value: "15" },
    { id: "16", value: "16" },
    { id: "17", value: "17" },
    { id: "18", value: "18" },
    { id: "19", value: "19" },
    { id: "20", value: "20" },
    { id: "21", value: "21" },
    { id: "22", value: "22" },
    { id: "23", value: "23" },
    { id: "24", value: "24" },
    { id: "25", value: "25" },
    { id: "26", value: "26" },
    { id: "27", value: "27" },
    { id: "28", value: "28" },
    { id: "29", value: "29" },
    { id: "30", value: "30" },
    { id: "31", value: "31" },
  ]

  const defaultYears = []
  for (let i = 1947; i <= currentYear - minYear; i++) {
    defaultYears.push({ id: i.toString(), value: i.toString() })
  }
  const [days, setDays] = useState([{ id: "", value: "" }])
  const [years, setYears] = useState([{ id: "", value: "" }])

  const [daySelected, setSelectedDay] = useState(
    days[Math.floor(days.length / 2)].id
  )
  const [monthSelected, setSelectedMonth] = useState<any>(
    months[Math.floor(months.length / 2)].id
  )
  const [yearSelected, setYearSelected] = useState(
    years[Math.floor(years.length / 2)].id
  )
  const [yearType, setYearType] = useState("non-leap")

  //NUMBER OF DAYS W.R.T MONTH AND YEAR
  const daysInMonth = (month: number, year: any) => {
    return new Date(year, month, 0).getDate()
  }
  //SET DAYS LIST TO THE PICKER
  const daysHandler = (no_of_days: number) => {
    const daysData = []
    const duplicateDaysData = []
    for (let i = 1; i <= no_of_days; i++) {
      daysData.push({ id: i.toString(), value: i.toString() })
      duplicateDaysData.push(i)
    }
    setDays(daysData)
    return duplicateDaysData
  }
  //SET THE LIST OF YEARS TO PICKER
  const yearsHandler = () => {
    const arr = []
    for (let i = 1947; i <= currentYear - minYear ; i++) {
      arr.push({ id: i.toString(), value: i.toString() })
    }
    setYears(arr)
  }
  useEffect(() => {
    if (daysInMonth(monthSelected, yearSelected) < parseInt(daySelected)) {
      //to select the middle array item
      //setSelectedDay(days[(Math.floor(days.length/2))].id)
      const abc = daysHandler(daysInMonth(monthSelected, yearSelected))
      //to select the max date in the month selected
      setSelectedDay(abc[abc.length - 1].toString())
    } else {
      daysHandler(daysInMonth(monthSelected, yearSelected))
      yearsHandler()
    }
  }, [monthSelected, yearType])

  //FORMAT AND SET THE FINAL DATE SELECTED
  const dateHandler = () => {
    const finalDate =
      daySelected.padStart(2, "0") +
      "-" +
      monthSelected.padStart(2, "0") +
      "-" +
      yearSelected
    setDateOfBirth(finalDate)
  }
  //CHEC YEAR TYPE LEAP/NON-LEAP
  const checkYearType = (yearValue: number) => {
    if ((0 == yearValue % 4 && 0 != yearValue % 100) || 0 == yearValue % 400) {
      return "leap"
    }
    return "non-leap"
  }
  //CHANGE MONTH
  const handleOnChangeMonth = (target: any) => {
    setSelectedMonth(target.id)
  }
  //CHANGE DAY
  const handleOnChangeDay = (target: any) => {
    setSelectedDay(target.id)
  }
  //CHANGE YEAR
  const handleOnChangeYear = (target: any) => {
    setYearSelected(target.id)
    const yearValue = parseInt(target.id)
    setYearType(checkYearType(yearValue))
  }
  return (
    <div className="flex gap-4 mx-6 mt-5">
      <WheelPicker
        data={months}
        idName="month"
        onChange={handleOnChangeMonth}
        height={180}
        width={210}
        itemHeight={20}
        selectedID={monthSelected ? monthSelected : months[5].id}
        color="#ccc"
        activeColor="#293B75"
        backgroundColor="#ECECEC"
      />
      <WheelPicker
        data={days.length > 1 ? days : defaultDays}
        idName="day"
        onChange={handleOnChangeDay}
        height={180}
        width={60}
        itemHeight={20}
        selectedID={
          daySelected
            ? daySelected
            : days.length > 1
              ? days[Math.floor(days.length / 2)].id
              : defaultDays[Math.floor(days.length / 2)].id
        }
        color="#ccc"
        activeColor="#293B75"
        backgroundColor="#ECECEC"
      />
      <WheelPicker
        data={years.length > 1 ? years : defaultYears}
        idName="year"
        onChange={handleOnChangeYear}
        height={180}
        width={100}
        itemHeight={20}
        selectedID={
          yearSelected
            ? yearSelected
            : years.length > 1
              ? years[Math.floor(years.length / 2)].id
              : defaultYears[Math.floor(years.length / 2)].id
        }
        color="#ccc"
        activeColor="#293B75"
        backgroundColor="#ECECEC"
      />
    </div>
  )
}

export default DatePicker
