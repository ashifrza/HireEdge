import { createBrowserRouter } from "react-router";
import { lazy } from "react";
import Protected from "./features/auth/components/Protected";

const Login = lazy(() => import("./features/auth/pages/Login"));
const Register = lazy(() => import("./features/auth/pages/Register"));
const Home = lazy(() => import("./features/interview/pages/Home"));
const Interview = lazy(() => import("./features/interview/pages/Interview"));
const Practice = lazy(() => import("./features/interview/pages/Practice"));
const Landing = lazy(() => import("./features/marketing/Landing"));


export const router = createBrowserRouter([
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/register",
        element: <Register />
    },
    {
        path: "/",
        element: <Landing />
    },
    {
        path: "/dashboard",
        element: <Protected><Home /></Protected>
    },
    {
        path:"/interview/:interviewId",
        element: <Protected><Interview /></Protected>
    },
    {
        path:"/interview/:interviewId/practice",
        element: <Protected><Practice /></Protected>
    }
])
