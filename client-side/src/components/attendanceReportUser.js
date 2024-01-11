// Display attendance report of user

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
    const [attendance, setAttendance] = useState([]);

  const getUserAttendance = () => {
    fetch("http://localhost:5000/getUserAttendance",{
        method:"POST",
        crossDomain:true,
        headers:{
          "Content-Type":"application/json",
          Accept:"application/json",
          "Access-Control-Allow-Origin":"*",
        },
        body: JSON.stringify({
         token: window.localStorage.getItem("token"),
        }),
      })
      .then((res)=>res.json())
    .then((data)=>{
        setAttendance(data.data)
    })

}

const getClassNumber = () => {
  fetch("http://localhost:5000/getClassNumber",{
      method: "GET",
})
      .then((res) => res.json())
      .then((data) => {
          setClassNumber(data.data[0].classNumber)
  })
}

const data1 = [
  {name: "Class you attend", value: attendance ,fill: "#17cf97"},
  {name: "Class you absent", value: classNumber-attendance , fill: "#ff1616"},
]

const data2 = [
    {name: "Number of class", Attend: attendance, Absent: classNumber-attendance}
]


  
    useEffect(() => {
        getUserAttendance();
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
          data={data1}
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
    


