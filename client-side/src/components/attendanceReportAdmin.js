// Display attendance report of all users

import React, { useEffect, useState, useCallback } from "react";

import {PieChart,
        Pie, 
        Sector,
        BarChart,
        Bar,
        XAxis,
        YAxis,
        CartesianGrid,
        Tooltip,
        Legend
      } from "recharts"



  const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const {
      cx,
      cy,
      midAngle,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      fill,
      payload,
      percent,
      value
    } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? "start" : "end";
  
    return (
      <g>
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
          {payload.name}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path
          d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
          stroke={fill}
          fill="none"
        />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text
          x={ex + (cos >= 0 ? 1 : -1) * 12}
          y={ey}
          textAnchor={textAnchor}
          fill="#333"
        >{`PV ${value}`}</text>
        <text
          x={ex + (cos >= 0 ? 1 : -1) * 12}
          y={ey}
          dy={18}
          textAnchor={textAnchor}
          fill="#000000 "
        >
          {`(Rate ${(percent * 100).toFixed(2)}%)`}
        </text>
      </g>
    );
  };
  
  export default function App() {
    const [classNumber, setClassNumber] = useState([]);
    const [AVGattendance, setAVGattendance] = useState([]);
    const [NameAndAttend, setArray] = useState([])

  const getAllUserExceptAdmin = () => {
    fetch("http://localhost:5000/getAllUserExceptAdmin",{
        method: "GET",
})
        .then((res) => res.json())
        .then((data) => { 
           
            const userattendances = data.data.map((user) => user.attendance);
            const avg = AverageofAttendance(userattendances)
            setAVGattendance(avg);
            const NameAndAttend = data.data.map(({ id, attendance }) => ({
              name: id,
              Attend: attendance
            }));
            setArray(NameAndAttend)

    })
}

const getClassNumber = () => {
  fetch("http://localhost:5000/getClassNumber",{
      method: "GET",
})
      .then((res) => res.json())
      .then((data) => {
          setClassNumber(data.data[0].classNumber)
          // console.log(data.data[0].classNumber)
  })
}
const AverageofAttendance = (attendance) => {
  const sum = attendance.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
  const average = sum / attendance.length;
  return average
}

const data = [
  {name: "Average of Student Attend", value: Math.floor(AVGattendance) ,fill: "#17cf97"},
  {name: "Average of Student Absent", value: Math.floor(classNumber-AVGattendance) , fill: "#ff1616"},
]

const data2= NameAndAttend.map(obj => ({...obj,Absent: classNumber-obj.Attend}))

  
    useEffect(() => {
        getAllUserExceptAdmin();
        getClassNumber();
    }, []);

    const [activeIndex, setActiveIndex] = useState(0);
    const onPieEnter = useCallback(
      (_, index) => {
        setActiveIndex(index);
      },
      [setActiveIndex]
    );
  
    return (
      <div className="attedanceReport-wrapper">
        <h3>AttendanceReport</h3>
        
      <PieChart width={600} height={400} fontSize={15} >
        <Pie
          
          activeIndex={activeIndex}
          activeShape={renderActiveShape}
          data={data}
          cx={300}
          cy={200}
          innerRadius={110}
          outerRadius={130}
          fill="#8884d8"
          dataKey="value"
          onMouseEnter={onPieEnter}
        />
      </PieChart>
      <BarChart
      
      width={500}
      height={400}
      data={data2}
      margin={{
        top: 0,
        right: 0,
        left: 0,
        bottom: 0,
      }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="Attend" stackId="a" fill="#17cf97" />
      <Bar dataKey="Absent" fill="#ff1616" />
    </BarChart>
      </div>
    );
  }
    

  


