import React, { useEffect, useState } from "react";
import {
    Card,
    Row,
    Col,
    Spinner,
    ListGroup
} from "react-bootstrap";

import {
    FaClipboardList,
    FaList,
    FaBalanceScale,
    FaUsers,
    FaTrophy
} from "react-icons/fa";

import {
    getDashboardStats,
    getDashboardCharts,
    getLatestRecommendation,
    getDashboardActivity
} from "../../services/dashboardService";

import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Tooltip,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
    Legend
} from "recharts";

const COLORS = [
    "#0d6efd",
    "#20c997",
    "#ffc107",
    "#dc3545",
    "#6f42c1",
    "#fd7e14"
];

const Dashboard = () => {

    const [stats, setStats] = useState({});
    const [chartData, setChartData] = useState([]);
    const [latest, setLatest] = useState(null);
    const [activity, setActivity] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        loadDashboard();

    }, []);

    const loadDashboard = async () => {

        try {

            const statsRes =
                await getDashboardStats();

            const chartRes =
                await getDashboardCharts();

            const latestRes =
                await getLatestRecommendation();

            const activityRes =
                await getDashboardActivity();

            setStats(statsRes.data);

            setChartData(chartRes.data);

            setLatest(latestRes.data);

            setActivity(activityRes.data);

        }

        catch (error) {

            console.error(error);

        }

        finally {

            setLoading(false);

        }

    };

    if (loading)
        return (
            <div className="text-center mt-5">
                <Spinner animation="border"/>
            </div>
        );

    return (

        <div className="container-fluid py-4">

            <h2 className="fw-bold mb-4">
                Dashboard
            </h2>

            <Row className="g-4">

                <Col md={3}>

                    <Card className="shadow border-0">

                        <Card.Body>

                            <FaClipboardList
                                size={35}
                                className="text-primary"
                            />

                            <h6 className="mt-3">
                                Total Decisions
                            </h6>

                            <h2>
                                {stats.total_decisions}
                            </h2>

                        </Card.Body>

                    </Card>

                </Col>

                <Col md={3}>

                    <Card className="shadow border-0">

                        <Card.Body>

                            <FaList
                                size={35}
                                className="text-success"
                            />

                            <h6 className="mt-3">
                                Alternatives
                            </h6>

                            <h2>
                                {stats.total_alternatives}
                            </h2>

                        </Card.Body>

                    </Card>

                </Col>

                <Col md={3}>

                    <Card className="shadow border-0">

                        <Card.Body>

                            <FaBalanceScale
                                size={35}
                                className="text-warning"
                            />

                            <h6 className="mt-3">
                                Criteria
                            </h6>

                            <h2>
                                {stats.total_criteria}
                            </h2>

                        </Card.Body>

                    </Card>

                </Col>

                <Col md={3}>

                    <Card className="shadow border-0">

                        <Card.Body>

                            <FaUsers
                                size={35}
                                className="text-danger"
                            />

                            <h6 className="mt-3">
                                Users
                            </h6>

                            <h2>
                                {stats.total_users}
                            </h2>

                        </Card.Body>

                    </Card>

                </Col>

            </Row>

            <Row className="mt-4">

                <Col md={12}>

                    <Card className="shadow">

                        <Card.Body>

                            <h4>

                                <FaTrophy className="text-warning"/>

                                {" "}Latest Recommendation

                            </h4>

                            {

                                latest ?

                                <>

                                    <h5>

                                        Decision :

                                        {latest.decision}

                                    </h5>

                                    <h3 className="text-success">

                                        {latest.recommended_alternative}

                                    </h3>

                                    <h5>

                                        Score :

                                        {latest.score}

                                    </h5>

                                </>

                                :

                                <p>

                                    No recommendation available.

                                </p>

                            }

                        </Card.Body>

                    </Card>

                </Col>

            </Row>

            <Row className="mt-4">

                <Col md={7}>

                    <Card className="shadow">

                        <Card.Body>

                            <h5>

                                Alternatives Per Decision

                            </h5>

                            <ResponsiveContainer
                                width="100%"
                                height={300}
                            >

                                <BarChart
                                    data={chartData}
                                >

                                    <CartesianGrid strokeDasharray="3 3"/>

                                    <XAxis
                                        dataKey="decision"
                                    />

                                    <YAxis/>

                                    <Tooltip/>

                                    <Legend/>

                                    <Bar
                                        dataKey="alternatives"
                                        fill="#0d6efd"
                                    />

                                </BarChart>

                            </ResponsiveContainer>

                        </Card.Body>

                    </Card>

                </Col>

                <Col md={5}>

                    <Card className="shadow">

                        <Card.Body>

                            <h5>

                                Decision Distribution

                            </h5>

                            <ResponsiveContainer
                                width="100%"
                                height={300}
                            >

                                <PieChart>

                                    <Pie

                                        data={chartData}

                                        dataKey="alternatives"

                                        nameKey="decision"

                                        outerRadius={100}

                                        label

                                    >

                                        {

                                            chartData.map((entry,index)=>(

                                                <Cell

                                                    key={index}

                                                    fill={
                                                        COLORS[
                                                            index %
                                                            COLORS.length
                                                        ]
                                                    }

                                                />

                                            ))

                                        }

                                    </Pie>

                                    <Tooltip/>

                                </PieChart>

                            </ResponsiveContainer>

                        </Card.Body>

                    </Card>

                </Col>

            </Row>

            <Row className="mt-4">

                <Col>

                    <Card className="shadow">

                        <Card.Body>

                            <h5>

                                Recent Activity

                            </h5>

                            <ListGroup>

                                {

                                    activity.map((item,index)=>(

                                        <ListGroup.Item
                                            key={index}
                                        >

                                            ✔ {item.type} :
                                            {" "}
                                            {item.title}

                                        </ListGroup.Item>

                                    ))

                                }

                            </ListGroup>

                        </Card.Body>

                    </Card>

                </Col>

            </Row>

        </div>

    );

};

export default Dashboard;