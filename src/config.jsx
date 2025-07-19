
let base_url = '/';
if(window.location.host == 'localhost') base_url = '/new_order_system/public/';
if(window.location.host == 'ourtownamerica.github.io') base_url = '/OrderSystem/public/';

let google_recaptcha_key = '6LdzDsgqAAAAAIb89Py5iqJ3Vc3eeIxyAVK8ORak';

export {base_url, google_recaptcha_key};