/**
 * @typedef {Object} Book
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {string} cover
 * @property {string} publisher
 * @property {string[]} authors
 * @property {'IDLE' | 'READING' | 'FINISHED'} status
 */

//TODO: DO Server Side Rendering(without Next.js)
//TODO: Do Server Side Rendering(with Next.js)
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ErrorBoundary } from 'react-error-boundary';
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Link,
	useParams
} from 'react-router-dom'

import { Logo } from './components/logo'
import { Cancel, Menu as MenuIcon } from '@material-ui/icons';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { DialogTitle, Dialog, DialogContent, Button, Hidden, Drawer, AppBar, TextField, List, ListItem, Divider, ListItemText, Typography, IconButton, Toolbar, CssBaseline } from '@material-ui/core';

// TODO: Create an IndexedDB alternative
// TODO: Create a Supabase alternative
function useLocalStorage(key, initialVal) {
	if (!initialVal) {
		throw new Error('Provide Initial Value for userLocalStorage');
	}

	function storageReducer(state, action) {
		let newState;
		if (action.type === 'add') {
			newState = [...state, action.data]
		} else if (action.type === 'set') {
			newState = { ...action.data }
		} else if (action.type === 'merge') {
			newState = { ...state, ...action.data }
		} else {
			throw new Error('Unknown action in storageReducer');
		}
		return newState;
	}

	let [state, dispatch] = React.useReducer(storageReducer, JSON.parse(localStorage.getItem(key)) || initialVal);

	React.useEffect(() => {
		localStorage.setItem(key, JSON.stringify(state))
	})

	return [state, dispatch];
}

function useRegistration() {
	let [registrations, dispatch] = useLocalStorage('registrations', []);
	function addRegistration({ username, password }) {
		dispatch({
			type: 'add',
			data: {
				username,
				password
			}
		})
	}

	function getRegistration({ username, password }) {
		let registration = registrations.filter((registration) => {
			return registration.username === username && registration.password === password
		})[0];
		return registration;
	}


	return [registrations[registrations.length - 1], {
		addRegistration,
		getRegistration
	}];
}

function useGraphql({ field, initialVal }) {
	let [data, setData] = React.useState(initialVal);
	React.useEffect(() => {
		async function getFromGraphQL() {
			let res = await fetch('http://127.0.0.1:9000/graphql', {
				method: 'POST',
				headers: {
					'content-type': 'application/json'
				},
				body: JSON.stringify({
					query: `
				{
					books {
						id
						description
						name
						cover
						publisher
						authors
					}
				}`
				})
			});
			let graphql = await res.json();
			setData(graphql.data[field])
		}
		getFromGraphQL();
	}, [field]);

	return [data, setData]
}

function useBooks() {
	let [repository, setRepository] = useGraphql({ field: 'books', initialVal: [] });

	// FIXME: useLocalStorage requires initial value to be passed wherever it's called. Think how it can be fixed.
	let [myBooks,] = useLocalStorage('MY_BOOKS', {})

	let books = repository.map((book) => {
		return { ...book, ...myBooks[book.id] }
	});

	function getBook(id) {
		return books.filter((book) => {
			return book.id === id
		})[0]
	}

	function getBooksWithStatus(status) {
		return books.filter((book) => {
			return book.status === status
		})
	}

	return [books, { setRepository, getBook, getBooksWithStatus }];
}

/**
 * @param {Book} book 
 */
function useBook(book) {
	let [storage, storageDispatch] = useLocalStorage('MY_BOOKS', {});

	function getAvailableActions(status) {
		let availableActions = [];
		if (status === 'IDLE') {
			availableActions.push('START_READING')
		} else if (status === 'READING') {
			availableActions.push('STOP_READING', 'FINISH')
		} else if (status === 'FINISHED') {
			availableActions.push('READ_AGAIN')
		} else {
			throw new Error(`Unknown status ${status} in getAvailableActions`);
		}
		return availableActions;
	}

	let [bookStatus, dispatch] = React.useReducer((state, action) => {
		let newState = '';
		switch (action) {
			case 'START_READING':
				if (state === 'IDLE' || state === 'FINISHED') {
					newState = 'READING'
				}
				break;
			case 'READ_AGAIN':
				if (state === 'FINISHED') {
					newState = 'READING'
				}
				break;
			case 'FINISH':
				if (state === 'READING') {
					newState = 'FINISHED'
				}
				break;
			case 'STOP_READING':
				if (state === 'READING') {
					newState = 'IDLE'
				}
				break;
			default:
		}
		if (!newState) {
			throw new Error(`Unknown action in useBook: Can't go from state ${state} with action ${action}`);
		}
		storageDispatch({ type: 'merge', data: { [book.id]: { status: newState } } });
		return newState;
	}, storage[book.id] ? storage[book.id].status : 'IDLE');


	return [bookStatus, { getAvailableActions, dispatch }];
}

/**
 * @param {{children: any, color?: 'primary'|'secondary', variant?: 'contained'|'outlined'|'text', style?: any}} props
 */
function DefaultButton({ children, color, variant = "contained", style, ...props }) {
	return <Button color={color} variant={variant} {...props} style={{ ...style, margin: 5 }}>{children}</Button>
}

function MyDialog({ title, open, setOpen, children }) {
	return <Dialog open={open}>
		<DialogTitle><span>{title}</span>
			<button style={{ float: 'right', background: 'transparent', border: 'none', cursor: 'pointer' }}>
				<Cancel variant="contained" onClick={() => { setOpen(false) }}>Close</Cancel>
			</button>
		</DialogTitle>
		<DialogContent>
			{children}
		</DialogContent>
	</Dialog>
}

function Login({ onLogin, ...props }) {
	let [loginStatus, setLoginStatus] = React.useState(false);


	let [error, setError] = React.useState(null);
	let [, {
		getRegistration
	}] = useRegistration();

	function onSubmit(e) {
		let { username: { value: username }, password: { value: password } } = e.target.elements;
		let registration = getRegistration({ username, password })
		if (registration) {
			onLogin(registration);
		} else {
			setError('Invalid username or password');
		}
		e.preventDefault();
	}

	return <>
		<DefaultButton {...props} variant="contained" onClick={() => { setLoginStatus(true) }}>Login</DefaultButton>
		<MyDialog open={loginStatus} title="Login" setOpen={setLoginStatus}>
			<form onSubmit={onSubmit} autoComplete="off">
				<div>
					<TextField name="username" label="Username" />
				</div>
				<div>
					<TextField name="password" label="Password" type="password" />
				</div>
				<div style={{ color: 'red' }}>{error}</div>
				<DefaultButton style={{ marginTop: 10 }} type="submit">Login</DefaultButton>
			</form>
		</MyDialog>
	</>
}

function Register({ onRegister, ...props }) {
	let [openState, setOpenState] = React.useState(false);
	let [registration, {
		addRegistration
	}] = useRegistration();

	let [error, setError] = React.useState(null);
	let [submissionStatus, setSubmissionStatus] = React.useState(false);

	React.useEffect(() => {
		if (submissionStatus) {
			onRegister(registration);
		}
	});

	function onSubmit(e) {
		let { username: { value: username }, password: { value: password }, 'confirm-password': { value: confirmPassword } } = e.target.elements;
		e.preventDefault();
		if (password !== confirmPassword) {
			setError('Passwords don\'t match');
			return;
		}

		addRegistration({
			username,
			password
		});
		setSubmissionStatus(true)
	}

	return <>
		<DefaultButton color="primary" {...props} variant="contained" onClick={() => { setOpenState(true) }}>Register</DefaultButton>
		<MyDialog open={openState} title="Register" setOpen={setOpenState}>
			<form onSubmit={onSubmit} autoComplete="off">
				<div>
					<TextField name="username" type="text" label="Username"></TextField>
				</div>
				<div>
					<TextField name="password" type="password" label="Password" ></TextField>
				</div>
				<div>
					<TextField name="confirm-password" type="password" label="Confirm Password"></TextField>
				</div>
				<div style={{ color: 'red' }}>{error}</div>
				<DefaultButton color="primary" style={{ marginTop: 10 }} type="submit">Register</DefaultButton>
			</form>
		</MyDialog>
	</>
}

function useUser(initialVal) {
	let [user, dispatch] = useLocalStorage('currentUser', initialVal || {});
	function setUser(user) {
		dispatch({
			type: 'set',
			data: user
		});
	}
	return [user, setUser];
}

function Homepage() {
	let [, setState] = React.useState('none');
	let [userInfo, setUserInfo] = useUser(null);

	function logout() {
		setUserInfo(null);
	}

	function onUserLogin(registration) {
		setState('loggedIn');
		setUserInfo(registration)
	}

	return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
		<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
			<Logo width="80" height="80" />
			<Typography><h1>Bookshelf</h1></Typography>
			{!userInfo.username ?
				<div>
					<Login style={{ margin: 2 }} onLogin={onUserLogin}></Login>
					<Register style={{ margin: 2 }} onRegister={onUserLogin}></Register>
				</div> :
				<div>
					<Typography><div>Welcome {userInfo.username}</div></Typography>
					<Typography><div><Link to="/discover">Discover the books</Link></div></Typography>
					<Typography><DefaultButton onClick={logout}>Logout</DefaultButton></Typography>
				</div>
			}
		</div>
	</div>
}

function BooksList({ books }) {
	return <ul style={{ paddingLeft: 0 }}>
		{
			books.map((book, i) => {
				return <li style={{ display: 'flex', padding: 6, margin: 10, border: '1px sold gray', borderRadius: '6px', boxShadow: '2px 2px 2px 2px gray' }} key={book.id}>
					<Book book={book}> </Book>
				</li>
			})
		}
	</ul>
}

function DiscoverBooks(params) {
	let [books,] = useBooks();
	return books.length ? <BooksList books={books}></BooksList> : <div>Oops, Can't access books. Try Again.</div>
}

function FinishedBooks(params) {
	let [, { getBooksWithStatus }] = useBooks();
	let books = getBooksWithStatus('FINISHED');
	return books.length ? <BooksList books={books} ></BooksList> : <Typography><div>Pick a <Link to="/discover">Book</Link> to finish</div></Typography>
}

function ReadingBooks(params) {
	let [, { getBooksWithStatus }] = useBooks();
	let books = getBooksWithStatus('READING');
	return books.length ? <BooksList books={books} ></BooksList> : <Typography><div>Start reading any of these <Link to="/discover">Books</Link> </div></Typography>
}

function BookPage() {
	let params = useParams();
	let [, {
		getBook
	}] = useBooks();
	let book = getBook(+params.id);
	if (!book) {
		throw new Error(`Book ${params.id} not found`);
	}
	return <Book book={book}></Book>
}

function Book({ book }) {
	let [status, { dispatch, getAvailableActions }] = useBook(book);
	let availableActions = getAvailableActions(status)
	return <div>
		<div style={{ display: 'flex' }}>
			<Link style={{ marginRight: '6px' }} to={"/book/" + book.id}>
				<img alt={"Cover of " + book.name} width="140px" src={book.cover} />
			</Link>
			<div style={{ display: 'flex', flexDirection: 'column' }}>
				<div style={{ display: 'flex', justifyContent: 'space-between' }}>
					<h2>{book.name}</h2>
					<i>
						<div>{book.authors}</div>
						<div>{book.publisher}</div>
					</i>
				</div>
				<div>{book.description}</div>
			</div>
		</div>
		<div style={{ display: 'flex' }}>
			{availableActions.includes('START_READING') ? <DefaultButton size="small" onClick={() => { dispatch('START_READING') }} variant="outlined">Start Reading</DefaultButton> : null}
			{availableActions.includes('STOP_READING') ? <DefaultButton size="small" onClick={() => { dispatch('STOP_READING') }} variant="outlined">Stop Reading</DefaultButton> : null}
			{availableActions.includes('FINISH') ? <DefaultButton size="small" onClick={() => { dispatch('FINISH') }} variant="outlined">Finish</DefaultButton> : null}
			{availableActions.includes('READ_AGAIN') ? <DefaultButton size="small" onClick={() => { dispatch('READ_AGAIN') }} variant="outlined">Read Again</DefaultButton> : null}
		</div>
	</div>
}

const drawerWidth = 240;
const useStyles = makeStyles((theme) => ({
	root: {
		display: 'flex',
	},
	drawer: {
		[theme.breakpoints.up('sm')]: {
			width: drawerWidth,
			flexShrink: 0,
		},
	},
	appBar: {
		[theme.breakpoints.up('sm')]: {
			width: `calc(100% - ${drawerWidth}px)`,
			marginLeft: drawerWidth,
		},
	},
	menuButton: {
		marginRight: theme.spacing(2),
		[theme.breakpoints.up('sm')]: {
			display: 'none',
		},
	},
	// necessary for content to be below app bar
	toolbar: theme.mixins.toolbar,
	drawerPaper: {
		width: drawerWidth,
	},
	content: {
		flexGrow: 1,
		padding: theme.spacing(3),
	},
}));

function MaterialUIWrapper(props) {
	const classes = useStyles();
	const theme = useTheme();

	const { window } = props;
	const [mobileOpen, setMobileOpen] = React.useState(false);

	const handleDrawerToggle = () => {
		setMobileOpen(!mobileOpen);
	};

	const drawer = (
		<div>
			<div className={classes.toolbar} />
			<Divider />
			<List>
				{[{ text: 'Discover', link: '/discover' }, { text: 'Finished Books', link: '/finished' }, { text: 'Reading Books', link: '/list' }, { text: 'Home', link: '/' }].map(({ text, link }, index) => (
					<Link to={link}>
						<ListItem button key={text}><Typography>{text}</Typography></ListItem>
					</Link>
				))}
			</List>
		</div>
	);

	const container = window !== undefined ? () => window().document.body : undefined;

	return (
		<div className={classes.root}>
			<CssBaseline />
			<AppBar position="fixed" className={classes.appBar}>
				<Toolbar>
					<IconButton
						color="inherit"
						aria-label="open drawer"
						edge="start"
						onClick={handleDrawerToggle}
						className={classes.menuButton}

					>
						<MenuIcon />
					</IconButton>
					<Typography variant="h6" noWrap>
						Bookshelf
					</Typography>
				</Toolbar>
			</AppBar>
			<nav aria-label="mailbox folders" className={classes.drawer} >
				<Hidden smUp implementation="css">
					<Drawer
						container={container}
						variant="temporary"
						anchor='right'
						open={mobileOpen}
						onClose={handleDrawerToggle}
						ModalProps={{
							keepMounted: true, // Better open performance on mobile.
						}}
						classes={{
							paper: classes.drawerPaper,
						}}
					>
						{drawer}
					</Drawer>
				</Hidden>
				<Hidden xsDown implementation="css">
					<Drawer
						classes={{
							paper: classes.drawerPaper,
						}}
						variant="permanent"
						open
					>
						{drawer}
					</Drawer>
				</Hidden>
			</nav>
			<div className={classes.content}>
				<div className={classes.toolbar} />
				{props.children}
			</div>
		</div>
	);

}

function NotFoundPage() {
	return <h1>The Page that you are looking for is unavailable</h1>
}

function App() {
	function FallbackComponent({ error }) {
		return <div>
			{error.message}
		</div>
	}

	return <Router>
		<MaterialUIWrapper>
			<Routes>
				<Route path="/" element={<Homepage></Homepage>}></Route>
				<Route path="/discover" element={<DiscoverBooks></DiscoverBooks>}></Route>
				<Route path="/finished" element={<FinishedBooks></FinishedBooks>}></Route>
				<Route path="/list" element={<ReadingBooks></ReadingBooks>}></Route>
				<Route path="/book/:id" element={
					<ErrorBoundary FallbackComponent={FallbackComponent}>
						<BookPage></BookPage>
					</ErrorBoundary>}>
				</Route>
				<Route path="*" element={<NotFoundPage></NotFoundPage>}></Route>
			</Routes>
		</MaterialUIWrapper>
	</Router>
}

ReactDOM.render(<App></App>, document.getElementById('root'))
