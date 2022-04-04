import { useState, useEffect } from "react";
import axios from "axios";
import {
  months,
  weekDays,
  currentDayString,
  firstDayOfMonth,
  daysInMonthFn,
} from "shared";

export const useCalendar = () => {
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [date, setDate] = useState(new Date(`${months[month]} ${year}`));
  const [tasks, setTasks] = useState([]);

  const monthChanger = e => {
    if (e.target.getAttribute("name") === "Previous") {
      if (month === 0) {
        setMonth(11);
        setYear(prev => prev - 1);
      } else {
        setMonth(prev => prev - 1);
      }
    }
    if (e.target.getAttribute("name") === "Next") {
      if (month === 11) {
        setMonth(0);
        setYear(prev => prev - 1);
      } else {
        setMonth(prev => prev + 1);
      }
    }
  };

  const emptydays = [];
  for (let i = 0; i < firstDayOfMonth(date); i++) {
    emptydays.push(
      <td key={`empty ${i}`} className="calendar-day empty">
        {""}
      </td>
    );
  }

  const daysInMonth = [];
  for (let d = 1; d <= daysInMonthFn(date); d++) {
    const dateString = `${date.getFullYear()}-${date.getMonth() + 1}-${d}`;
    const currentDayClass =
      currentDayString() === dateString ? "current-day" : "";
    daysInMonth.push(
      <td key={d} id={dateString} className="calendar-day">
        <span className={currentDayClass}>{d}</span>
      </td>
    );
  }
  const weekDayHeader = weekDays.map(weekday => {
    return (
      <th key={weekday} className="calendar__weekdayheader">
        {weekday}
      </th>
    );
  });

  const totalSlots = [...emptydays, ...daysInMonth];
  let rows = [];
  let cells = [];

  totalSlots.forEach((slot, index) => {
    if (index % 7 !== 0) {
      cells.push(slot); // if index not equal 7 that means not go to next week
    } else {
      rows.push(cells); // when reach next week we contain all td in last week to rows
      cells = []; // empty container
      cells.push(slot); // in current loop we still push current row to new container
    }
    if (index === totalSlots.length - 1) {
      // when end loop we add remain date
      rows.push(cells);
    }
  });

  let monthInRows = rows.map((week, i) => {
    if (week.length > 0) {
      return <tr key={`week ${i}`}>{week}</tr>;
    }
    return null;
  });

  useEffect(() => {
    const lastday = daysInMonthFn(date);
    const queryMonth = month + 1;
    const url = `/api/tasks?startdate=${year}-${queryMonth}-1&enddate=${year}-${queryMonth}-${lastday}`;
    axios.get(url).then(data => {
      console.log(data.data);
      setTasks(data.data);
    });
  }, [date]);

  return {
    month,
    year,
    date,
    setDate,
    monthChanger,
    weekDayHeader,
    emptydays,
    daysInMonth,
    monthInRows,
  };
};
