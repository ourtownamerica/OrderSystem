import {StrictMode, useRef, useEffect} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter as Router, Route, Routes, useLocation} from 'react-router-dom';
import {Outlet} from 'react-router';
import { toast } from 'react-toastify';
import Home from './routes/Home.jsx';
import Login from './routes/Login.jsx';
import {base_url} from './config.jsx';
import Help from './routes/Help.jsx';
import ForgotPW from './routes/ForgotPW.jsx';
import SignUp from './routes/SignUp.jsx';
import NotFound from './routes/NotFound.jsx';
import Navbar from "./components/Navbar.jsx";
import AppContext from "./provider/AppContext.jsx";
import AppProvider from "./provider/AppProvider.jsx";
import Footer from './components/Footer.jsx';
import HelpCategory from './routes/HelpCategory.jsx';
import HelpTopic from './routes/HelpTopic.jsx';
import C from './routes/C.jsx';

import './css/bootstrap.min.css';
import './css/common.css';
import { ToastContainer } from 'react-toastify';
import LocationProvider from './provider/LocationProvider.jsx';
import VerifyEmail from './routes/VerifyEmail.jsx';
import Profile from './routes/Profile.jsx';

function AppRoutes() {
	const location = useLocation();
	return (<Routes>
		<Route path="/" element={<App />} location={location} key={location.key}>
			<Route path="/" element={<Home />} />
			<Route path="/c/:slugOrId" element={<C />} />
			<Route path="/login" element={<Login />} />
			<Route path="/help" element={<Help />} />
			<Route path="/helpcategory/:slugOrId" element={<HelpCategory />} />
			<Route path="/helptopic/:slugOrId" element={<HelpTopic />} />
			<Route path="/forgotpw" element={<ForgotPW />} />
			<Route path="/signup" element={<SignUp />} />
			<Route path="/verifyemail" element={<VerifyEmail />} />
			<Route path="/profile" element={<Profile />} />
			<Route path="*" element={<NotFound />} />
		</Route>
	</Routes>);
}
  
(async function main(){
	const rootDiv = document.createElement('div');
	rootDiv.setAttribute('id', 'main');
	document.body.prepend(rootDiv);
	const reactRoot = createRoot(rootDiv);
	reactRoot.render(<StrictMode>
		<Router basename={base_url}>
			<LocationProvider>
				<AppRoutes />
			</LocationProvider>
		</Router>
	</StrictMode>);
})();

function App(){
	const appProvider = new AppProvider();
	const activeProcesses = useRef({});

	useEffect(()=>{
		const onLoadStart = async event => {
			let toastHandler = {
				id: null,
				timer: setTimeout(()=>{
					toastHandler.id = toast(`${event.message}`, {
						autoClose: false,
						draggable: false,
						closeOnClick: false,
						hideProgressBar: true,
						closeButton: true,
						type: 'info'
					});
				}, 1000)
			};
			activeProcesses.current[event.loadId] = toastHandler;
		};
		appProvider.on("loadStart", onLoadStart);

		const onLoadEnd = async event => {
			let toastHandler = activeProcesses.current[event.loadId];
			if(toastHandler){
				clearTimeout(toastHandler.timer);
				if(toastHandler.id) toast.dismiss(toastHandler.id); 
			}
			toast(`${event.message}`, {
				autoClose: 3000,
				draggable: false,
				closeOnClick: true,
				hideProgressBar: true,
				closeButton: true,
				type: 'success'
			});
			delete activeProcesses.current[event.loadId];
		};
		appProvider.on("loadEnd", onLoadEnd);

		const onLoadError = async event => {
			let toastHandler = activeProcesses.current[event.loadId];
			if(toastHandler){
				clearTimeout(toastHandler.timer);
				if(toastHandler.id) toast.dismiss(toastHandler.id); 
			}
			toast(`${event.message}`, {
				autoClose: 3000,
				draggable: false,
				closeOnClick: true,
				hideProgressBar: true,
				closeButton: true,
				type: 'error'
			});
			delete activeProcesses.current[event.loadId];
		};
		appProvider.on("loadError", onLoadError);

		return ()=>{
			appProvider.off("loadStart", onLoadStart);
			appProvider.off("loadEnd", onLoadEnd);
			appProvider.off("loadError", onLoadError);
		};
	}, [appProvider]);

	return <AppContext.Provider value={appProvider}>
		<Navbar />
		<div className="container pt-4" id='outletcontainer'>
			<Outlet />
		</div>
		<Footer />
		<ToastContainer position="bottom-right" />
	</AppContext.Provider>
}


