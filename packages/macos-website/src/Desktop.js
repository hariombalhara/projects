import * as React from 'react'
function WindowMenu({ name }) {
	return <div className="relative h-6 text-center bg-gray-300">
		<div className="flex flex-row absolute left-0 space-x-2 pl-2 mt-1.5">
			<button className="w-3 h-3 rounded-full bg-red-500 outline-none focus:outline-none"></button>
			<button className="w-3 h-3 rounded-full bg-yellow-500 outline-none focus:outline-none"></button>
			<button className="w-3 h-3 rounded-full bg-green-500 outline-none focus:outline-none"></button>
		</div>
		<span className="font-semibold text-gray-700">{name}</span>
	</div>
}


function StatusBar({ activityName = 'Playground' }) {
	return <div className="flex flex-row items-center space-x-4"><img className="h-4 filter-invert" src="menuicons/Apple.png" alt="apple_icon" />
		<span className="font-semibold">{activityName}</span>
	</div>
}

function BatteryStatusMenuItem() {
	return <div className="inline-flex flex-row space-x-1 hover:bg-white hover:bg-opacity-50 rounded p-1">
		<span className="text-xs">100%</span>
		<img className="h-4 filter-invert" src="menuicons/battery.100.png" alt="battery" />
	</div>
}
function SearchBarMenuItem() {
	return <div className="inline-flex flex-row space-x-1 hover:bg-white hover:bg-opacity-50 rounded p-1">
		<img className="h-4 filter-invert" src="menuicons/magnifyingglass.png" alt="search" />
	</div>
}

function TilesMenuItem() {
	return <div className="inline-flex flex-row space-x-1 hover:bg-white hover:bg-opacity-50 rounded p-1"><img className="w-4 h-4 filter-invert" src="menuicons/controlcenter.png" alt="control center" /></div>
}

function DateMenuItem() {
	return <span>Fri 13 Aug 2:43 PM</span>
}

function Menu() {
	return <div className="w-full h-6 px-4 fixed top-0 flex flex-row justify-between items-center text-sm text-white bg-indigo-700 bg-opacity-10 blur shadow transition">
		<StatusBar>MenuBar</StatusBar>
		<div className="flex flex-row justify-end items-center space-x-2">
			<BatteryStatusMenuItem></BatteryStatusMenuItem>
			<SearchBarMenuItem></SearchBarMenuItem>
			<TilesMenuItem></TilesMenuItem>
			<DateMenuItem></DateMenuItem>
		</div>
	</div>
}

function Dock({ children }) {
	return <div className="w-full pb-2 fixed bottom-0">
		<ul className="mx-auto w-max p-2 space-x-2 flex flex-row justify-center justify-between bg-white bg-opacity-25 blur rounded-2xl shadow-2xl">
			{children}
		</ul>
	</div>
}

function Window({ name = 'Terminal', className, activityType, activityData }) {
	let activities = {
		'Terminal': <div className="innner-window w-full overflow-y-hidden"><div className="w-full h-full bg-black text-white"></div></div>,
		'Notes': <div className="p-2" contentEditable>{activityData.content}</div>,
		'Safari': <div className="innner-window w-full overflow-y-hidden"><div className="w-full h-full"><div className="h-8 flex justify-center items-center bg-white"><input type="text" className="h-6 w-4/5 p-2 rounded text-center font-normal text-gray-500 bg-gray-100" value={activityData.url} /></div><iframe title="Safari browser" src={activityData.url} frameBorder="0" className="h-full w-full"></iframe></div></div>
	}
	let classes = [className, "absolute transition-hw rounded-lg overflow-y-hidden bg-white h-3/5 w-1/2 mt-16 mb-24 shadow-md"].join(" ");
	return <div className={classes}>
		<WindowMenu name={name}></WindowMenu>
		{activities[activityType]}
	</div>
}

export function NotesWindow({ content = 'Default Content', className }) {
	return <Window name="Notes" className={className}></Window>
}


export default function Desktop() {
	// Shows 1 window at a time.
	let [selectedWindow, setSelectedWindow] = React.useReducer((state, action) => {
		// Hide the currently selected window which means don't show any window if the same window icon is clicked from Dock
		if (state === action) {
			return null
		}
		return action;
	}, "Notes");

	//let [menuStatus, setMenuStatus] = React.useState();
	let allActivities = {
		Notes: {
			icon: 'icons/text.png',
			title: 'Notes',
			initialData: {
				content: 'Default Notes Content'
			}
		},
		Terminal: {
			icon: 'icons/terminal.png',
			title: 'Terminal'
		},
		Safari: {
			icon: 'icons/safari.png',
			title: 'Safari',
			initialData: {
				url: 'https://cdpn.io/hariom_balhara/fullpage/oNZQQpB'
			}
		}
	};

	let dockerActivities = ['Notes', 'Terminal', 'Safari'];
	
	return <div className="h-screen overflow-hidden bg-center bg-cover" style={{ backgroundImage: 'url("img/wallpaper.jpg")' }}>
		<Menu></Menu>
		{dockerActivities.map((activityName) => {
			let activity = allActivities[activityName]
			return React.createElement(Window, {
				name: activityName,
				activityType: activityName,
				className: selectedWindow !== activityName ? 'hidden' : '',
				activityData: activity.initialData || {}
			})
		})}
		<Dock>
			{dockerActivities.map((activityName) => {
				let activity = allActivities[activityName]
				return <li onClick={() => { setSelectedWindow(activityName) }}>
					<img className="w-12" src={activity.icon} alt={activity.title} title={activity.title} />
				</li>
			})}
		</Dock>
	</div>
}