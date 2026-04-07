import Sidebar from "./Sidebar";
import Charts from "./Charts";

export default function Dashboard(){
    return(
        <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ padding: "20px", flex: 1 }}>
        <h2>Dashboard</h2>
        <Charts />
      </div>
    </div>
  );
}