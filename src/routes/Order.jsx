import { useParams, useNavigate } from "react-router-dom";
import {useContext, useEffect} from 'react';
import AppContext from "../provider/AppContext.jsx";
import Page from "../components/Page.jsx";

export default function Order(){
	const appProvider = useContext(AppContext);
	const navigate = useNavigate();
	const {orderId} = useParams();

	return (<Page>
		<p>Order #{orderId}...</p>
	</Page>);
}