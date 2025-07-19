import { useParams, useNavigate } from "react-router-dom";
import {useEffect, useState, useContext} from 'react';
import AppContext from "../provider/AppContext.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHandshakeAngle, faSpinner, faDownload} from '@fortawesome/free-solid-svg-icons';
import PageHeader from "../components/PageHeader.jsx";
import Page from "../components/Page.jsx";

export default function HelpTopic(){
	const {slugOrId} = useParams();
	let [loading, setLoading] = useState(false);
	let [topic, setTopic] = useState(null);
	const navigate = useNavigate();
	const appProvider = useContext(AppContext);

	useEffect(()=>{
		(async ()=>{
			setLoading(true);
			let topic = await appProvider.getHelpTopic(slugOrId);
			setTopic(topic);
			setLoading(false);
		})();
	}, []);

	let pageBody, author;
	if(loading){
		pageBody = (<div className='text-center'>
			<FontAwesomeIcon icon={faSpinner} className="fa-spin-pulse" />
		</div>);
	}else if(!topic){
		<p className='text-center text-secondary'>Topic not found.</p>
	}else{
		author = (<>
			<p className='sm text-secondary mt-0'>By {topic.author} on {new Intl.DateTimeFormat(undefined, {dateStyle: 'long', timeStyle: 'short', hour12: true}).format(new Date(topic.last_update_date))}</p>
			{(topic.assets||[]).map((asset, idx)=>{
				return (<a target='_blank' key={idx} className='d-block' href={`https://rockwell.ourtownamerica.com/intra/help_topics/api/serve_asset.php?id=${asset.id}`}>
					<FontAwesomeIcon icon={faDownload} /> {asset.name}
				</a>);
			})}
		</>);
		pageBody = (<>
			{topic.overview && <div className='alert alert-info'>{topic.overview}</div>}
			{topic.content && <div className='help-content' dangerouslySetInnerHTML={{__html: topic.content}}></div>}
		</>);
	}

	return (<Page>
		<PageHeader icon={faHandshakeAngle} title={topic?.title||'Help Topic'}>{author}</PageHeader>
		{pageBody}
	</Page>);
}