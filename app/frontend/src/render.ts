export function renderLogin() {
    const loginPage = `
		<div
			class="flex flex-col justify-center items-center h-screen m-0 bg-gradient-to-br
			from-gray-900 via-gray-800 to-black font-serif"
			style="background: url('icons/mordor.gif') center center / cover no-repeat fixed"
		>
			<img
				src="icons/sauron.png"
				alt="Barad-dûr Logo"
				class="w-24 h-24 mb-4 drop-shadow-2xl"
				style="
					filter: brightness(0) saturate(100%) invert(64%) sepia(92%) saturate(3557%)
						hue-rotate(2deg) brightness(101%) contrast(104%);
				"
			/>
			<h1
				class="mb-8 text-5xl font-extrabold text-amber-500 drop-shadow-lg tracking-widest
				font-lora italic"
				style="text-shadow: 0 2px 12px #ff6600, 0 0px 1px #fff"
			>
				Lord of the Transcendence
			</h1>
			<div
				class="bg-gradient-to-br from-gray-800 via-gray-900 to-black p-8 rounded-3xl
				shadow-2xl w-96 border-4 border-amber-900/60 backdrop-blur-md ring-2
				ring-amber-700/40"
			>
				<h2 class="text-2xl font-bold mb-6 text-center text-amber-400 tracking-wider
				font-lora">
					Connexion
				</h2>
				<form action="login.html" method="POST" class="flex flex-col gap-5">
					<input
						type="text"
						name="username"
						placeholder="Pseudo"
						required
						class="px-4 py-2 border border-amber-900/40 rounded-lg bg-gray-900/60
						text-amber-200
						placeholder-amber-600 focus:outline-none focus:ring-2
						focus:ring-amber-700 focus:border-amber-700 transition font-lora"
					/>
					<input
						type="password"
						name="password"
						placeholder="password"
						required
						class="px-4 py-2 border border-amber-900/40 rounded-lg bg-gray-900/60
						text-amber-200 placeholder-amber-600 focus:outline-none focus:ring-2
						focus:ring-amber-700 focus:border-amber-700 transition font-lora"
					/>
					<button
						type="submit"
						class="px-4 py-2 bg-gradient-to-r from-amber-900 via-amber-700 to-red-900
						text-amber-100 rounded-lg font-bold hover:from-amber-700 hover:to-red-800
						 shadow-lg transition-all duration-200 tracking-wider font-lora border-2
						 border-amber-900"
					>
						Connect
					</button>
				</form>
			</div>
		</div>
	`;
    document.body.innerHTML = loginPage;
}

export function renderProfile() {}
export function renderDashboard() {}
export function renderGame() {}
export function renderSettings() {}

export function renderNotFound() {
    const notFoundPage = `
		<div
			class="flex flex-col justify-center items-center h-screen m-0 bg-gradient-to-br
			from-gray-900 via-gray-800 to-black font-serif"
			style="background: url('icons/mordor.gif') center center / cover no-repeat fixed"
		>
			<img
				src="icons/sauron.png"
				alt="Ring Icon"
				class="w-24 h-24 mb-4 drop-shadow-2xl"
				style="
					filter: brightness(0) saturate(100%) invert(64%) sepia(92%) saturate(3557%)
						hue-rotate(2deg) brightness(101%) contrast(104%);
				"
			/>
			<h1
				class="mb-4 text-7xl font-extrabold text-amber-500 drop-shadow-lg tracking-widest
				font-lora italic"
				style="text-shadow: 0 2px 12px #ff6600, 0 0px 1px #fff"
			>
				404: page not found
			</h1>
			<p class="text-xl text-amber-100 text-center mb-6 drop-shadow font-lora">
				<span class="italic text-amber-400">"Not all those who wander are lost..."</span>
			</p>
			<a
				href="/"
				class="mt-4 text-amber-400 underline font-bold text-lg drop-shadow-lg
				hover:text-amber-200 transition font-lora"
				style="text-shadow: 1px 1px 6px #000"
			>
				Back to the Mordor
			</a>
		</div>
	`;
    document.body.innerHTML = notFoundPage;
}
