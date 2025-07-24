import {base_url} from '../config.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faStamp, faCircleUser, faRightFromBracket, faEnvelopesBulk, faTable } from '@fortawesome/free-solid-svg-icons';
import { useLocation, useNavigate } from "react-router-dom";
import {useState, useContext, useEffect, useRef} from 'react';
import AppContext from "../provider/AppContext.jsx";

export default function Navbar(){
	const location = useLocation();

	const [navId, setNavId] = useState("");
	useEffect(() => {
		setNavId(`nav-collapse-${Math.random().toString().substring(2)}`);
	}, []);

	const appProvider = useContext(AppContext);
	const navigate = useNavigate();

	const isLoggedIn = appProvider.isLoggedIn();

	const collapseMenu = () => {
		let navbar = document.getElementById(navId);
		let isOpen = navbar.classList.contains('show');
		if(isOpen){
			new bootstrap.Collapse(`#${navId}`, {hide:true});
		}
	};

	const nav = (e, path) => {
		e.preventDefault();
		navigate(path);
		collapseMenu();
	};

	const logout = e => {
		e.preventDefault();
		appProvider.logout();
		navigate('/login');
		collapseMenu();
	};

	const navbarButtons = [];

	navbarButtons.push(<li className="nav-item" key='/'>
		<a href="#" onClick={e=>nav(e, '/')} className={`nav-link ${location.pathname == '/' ? 'active' : ''}`} {...(location.pathname == '/' && {"aria-current":"page"})}>
			<FontAwesomeIcon icon={faHouse} /> Home
		</a>
	</li>);

	if(isLoggedIn){
		navbarButtons.push(<li className="nav-item dropdown" key='/orders'>
			<a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
				<FontAwesomeIcon icon={faEnvelopesBulk} /> Orders
			</a>
			<ul className="dropdown-menu">
				<li>
					<a className="dropdown-item" href="#" onClick={e=>nav(e, '/neworder')}>
						New Order
					</a>
				</li>
				<li>
					<a className="dropdown-item" href="#" onClick={e=>nav(e, '/orderstatus')}>
						Order Status
					</a>
				</li>
			</ul>
		</li>);

		/*
		
		navbarButtons.push(<li className="nav-item" key='/templates'>
			<a href="#" onClick={e=>nav(e, '/templates')} className={`nav-link ${location.pathname == '/templates' ? 'active' : ''}`} {...(location.pathname == '/' && {"aria-current":"page"})}>
				<FontAwesomeIcon icon={faStamp} /> Templates
			</a>
		</li>);

		navbarButtons.push(<li className="nav-item" key='/reports'>
			<a href="#" onClick={e=>nav(e, '/reports')} className={`nav-link ${location.pathname == '/reports' ? 'active' : ''}`} {...(location.pathname == '/' && {"aria-current":"page"})}>
				<FontAwesomeIcon icon={faTable} /> Reports
			</a>
		</li>);

		*/
	}

	navbarButtons.push(<li className="nav-item dropdown" key='/user'>
		<a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
			<FontAwesomeIcon icon={faCircleUser} />
		</a>
		<ul className="dropdown-menu">
			{isLoggedIn && (<li>
				<a className="dropdown-item" href="#" onClick={e=>nav(e, '/profile')}>
					My Account
				</a>
			</li>)}
			<li>
				<a className="dropdown-item" href="#" onClick={e=>nav(e, '/help')}>
					Help
				</a>
			</li>
			{isLoggedIn ? (<li>
				<a className="dropdown-item" href="#" onClick={logout}>
					<FontAwesomeIcon icon={faRightFromBracket} /> Logout
				</a>
			</li>) : (<li>
				<a className="dropdown-item" href="#"  onClick={e=>nav(e, '/login')}>
					Login
				</a>
			</li>)}
		</ul>
	</li>);
	
	let navbar_logo = appProvider.getProp('vanity_logo');
	let navbar_name = appProvider.getProp('vanity_name') ?? '';

	let logo_url = navbar_logo 
		? `https://rockwell.ourtownamerica.com/intra/api/ordersys/serve-logo.php?img=${navbar_logo}&_=${new Date().getTime()}` 
		: `${base_url}assets/img/new_logo_text.png`;

	let navbar_brand = (<a className="navbar-brand" href="#" onClick={e=>nav(e, '/')}>
		<img src={logo_url} height="30" className="d-inline-block align-text-top" />{navbar_name ? ` ${navbar_name}` : ''}
	</a>);

	return (<nav className="navbar navbar-expand-lg bg-light top-navbar">
		<div className="container">
		  {navbar_brand}
		  <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target={`#${navId}`}>
			<span className="navbar-toggler-icon" />
		  </button>
		  <div className="collapse navbar-collapse" id={navId}>
			<ul className="navbar-nav ms-auto mb-2 mb-lg-0">
			  {navbarButtons}
			</ul>
		  </div>
		</div>
	  </nav>);
}