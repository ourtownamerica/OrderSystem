import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export default function Alert({ title, onClose, children }){
	const [isVisible, setIsVisible] = useState(false);
	const elRef = useRef(null);

	useEffect(() => {
		const div = document.createElement('div');
		elRef.current = div;
		document.body.appendChild(div);

		const showTimeout = setTimeout(() => {
			setIsVisible(true);
		}, 50);

		return () => {
			setIsVisible(false);
			const hideTimeout = setTimeout(() => {
				if (elRef.current && document.body.contains(elRef.current)) {
					document.body.removeChild(elRef.current);
				}
			}, 300);
			clearTimeout(showTimeout);
			clearTimeout(hideTimeout);
		};
	}, []);

	if (!elRef.current) {
		return null;
	}

	return createPortal(
		<>
			<div className={`modal-backdrop fade ${isVisible ? 'show' : ''}`}></div>
			<div className={`modal d-block fade ${isVisible ? 'show' : ''}`} tabIndex="-1" aria-labelledby="modal-title" role="dialog" aria-modal="true">
				<div className="modal-dialog modal-dialog-centered" role="document">
					<div className="modal-content">
						<div className="modal-header">
							<h5 className="modal-title" id="modal-title">{title || 'Alert'}</h5>
							<button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
						</div>
						<div className="modal-body">
							{children}
						</div>
						<div className="modal-footer">
							<button type="button" className="btn btn-secondary" onClick={onClose}>
								Close
							</button>
						</div>
					</div>
				</div>
			</div>
		</>,
		elRef.current
	);
}