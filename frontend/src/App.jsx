import "./App.css";

const Userinfo = [
  {
    uniqueNo: 1,
    name: "jahnavi",
    role: "student",
    experience: 0,
  },
  {
    uniqueNo: 2,
    name: "sita",
    role: "software developer",
    experience: 2,
  },
  {
    uniqueNo: 3,
    name: "ram",
    role: "software developer",
    experience: 10,
  },
];


const App =()=>{
    <div>
        <h1> Users Information </h1>
        {Userinfo.map((eachItem)=>()}
    </div>
}
export default App;
