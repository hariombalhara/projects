import * as React  from 'react';
import * as ReactDOM from 'react-dom';
import Desktop from './Desktop';
import Login from './Login';
import './styles.css'

function App() {
	let isLoggedIn  = true;
	if (!isLoggedIn) {
		return <Login></Login>
	} else {
		return <Desktop></Desktop>
	}
}

ReactDOM.render(<App></App>, document.getElementById('root'));