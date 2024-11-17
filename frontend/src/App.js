import logo from './logo.svg';
import './App.css';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Signup from './pages/Signup';
import Signin from './pages/Signin';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Home from './pages/Home';
const router = createBrowserRouter([
  {
    path: "/",
    element: <div>Hello world!</div>,
  },
  {
    path: "/signin",
    element: <Signin/>,
  },
  {
    path: "/signup",
    element: <Signup/>,
  },
  {path:"/home",element:<Home/>,},
]);
function App() {
  return (
   <>
    <RouterProvider router={router}>
    </RouterProvider>
    <ToastContainer />
   </>
  );
}

export default App;