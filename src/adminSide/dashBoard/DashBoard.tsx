import { useEffect, useState } from "react";
import Axios from "../../axious/instance";
import AdminSideBar from "../AdminSideBar/AdminSideBar";
import Chart from "./dashboardComponet/Chart"; 
import ChartUseresActuvties from "./dashboardComponet/ChartUseresActuvties";
import MonthlyUsers from "./dashboardComponet/MonthlyUsers";





const Dashboard = () => {

    const [userCounts, setUserCounts] = useState({
        totalUsers: 0,
        upgradeCount: 0,
        adminCount: 0,
        blockedCount: 0,
    });
    const [userActivities, setUserActivities] = useState({
        userCount: 0,
        postCount: 0,
        commentCount: 0,
        followCount: 0,
      });

      const [monthlyUsers, setMonthlyUsers] = useState([]);

    useEffect(() => {
        const fetchUserCounts = async () => {
            try {
                const response = await Axios.get('/api/user/user-counts');
                setUserCounts(response.data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchUserCounts();
    }, []);
    
    useEffect(() => {
        const fetchUserActivities = async () => {
          try {
            const response = await Axios.get("/api/user/userActivties"); 
            setUserActivities(response.data);
      
          } catch (error) {
            console.error(error);
          }
        };
    
        fetchUserActivities();
      }, []);

      useEffect(() => {
        const fetchMonthlyUsers = async () => {
          try {
            const response = await Axios.get('/api/user/monthly-users');
            setMonthlyUsers(response.data);
          } catch (error) {
            console.error(error);
          }
        };
    
        fetchMonthlyUsers();
      }, []);

    return (
        <div className="bg-black">
            <div>
                <AdminSideBar />
            </div>
           
                <ul className="flex flex-wrap ml-20">
                    
                    <div>
                        <Chart data={userCounts}   /> 
                    </div>
                    <div>
                    <ChartUseresActuvties data={userActivities}/>
                    </div>
                    </ul>
                    <div>
                    <MonthlyUsers data={monthlyUsers}/>
                    </div>
                    
                    
                 
               
            </div>
      
    );
};

export default Dashboard;
