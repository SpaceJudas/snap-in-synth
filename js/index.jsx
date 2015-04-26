var Page = React.createClass({
	getInitialState: function() {
		return {
			modules: [{
				name: 'osc',
				properties: {wave:'sin', freq:500}
			}],
			sequence: null,
		};
	},

	isPlaying: function() {
		return (this.state.sequence != null);
	},

	addNewModule: function(m) {
		var modules = this.state.modules
		m.myT = T(m.name, m.properties)
		modules.push(m)
		var sequence = this.state.sequence
		if (this.isPlaying()) {
			sequence.append(m.myT)
		}

		this.setState({
			modules: modules,
			sequence: sequence,
		})
	},

	oscChanged: function(i, values) {
		var modules = this.state.modules;
		modules[i] = values;
		this.setState({modules: modules});
	},

	togglePlay: function() {
		if (this.state.sequence == null) {
			this.play();
		}
		else {
			this.pause();
		}
	},

	play: function() {
		if (this.state.sequence != null) {
			//pause first so we're not playing multiple sequences
			this.state.sequence.pause();
		}
		var sequence = null;
		this.state.modules.forEach(function (m) {
			m.myT = T(m.name, m.properties);
			if (sequence == null) {
				sequence = m.myT;
			} else {
				sequence = sequence.append(m.myT);
			}
		});
		this.setState({sequence: sequence});
		sequence.play();
		console.log('playing');
	},

	pause: function() {
		if (this.state.sequence != null) {
			this.state.sequence.pause();
			this.state.sequence = null
		}
	},

	render: function() {
		return (
			<div>
				<div className="header-row">
					<h1>Snap-In Synth</h1>
				</div>
				<div className="button-row">
					<ModuleSelector addNewModule={this.addNewModule} />
					<PlayButton playFn={this.togglePlay} />
				</div>
				<div className="module-row">
					{this.state.modules.map(function(s, i) {
						return <Module key={i} o={s} id={i} changed={this.oscChanged} />;
					}.bind(this))}
				</div>
			</div>
		);
	}
});

var Module = React.createClass({
	changed: function() {
		var wave = $(this.getDOMNode()).find('select').val();
		var freq = $(this.getDOMNode()).find('input').val();
		//var mod = JSON.parse(JSON.stringify(this.props.o));

		this.props.o.properties.wave = wave;
		this.props.o.properties.freq = parseInt(freq);
		if (this.props.o.myT != null) {
			this.props.o.myT.set(this.props.o.properties)
		}

		this.props.changed(this.props.id, this.props.o);
	},
	render: function() {
		var cOptions = ['sin','cos','pulse','saw','tri','fami','konami'];
		var rOptions = [];
		cOptions.forEach(function(o) {
			rOptions.push(<option value={o}>{o}</option>)
		})

		return (
			<div className='module'>
				<select onChange={this.changed} value={this.props.o.properties.wave}>
					{rOptions}
				</select>
				<input type='range' min='0' max='2600' step='1' onChange={this.changed} />
			</div>
		);
	}
});

var ModuleSelector = React.createClass({
	availableModules: [
		{
			name: 'osc',
			properties: {wave:'sin', freq:500}
		},
		{
			name: 'noise',
			properties: {mul:1, add:0}
		}
	],

	add: function() {
		var i = $(this.getDOMNode()).find('select').val()
		this.props.addNewModule(this.availableModules[i])
	},

	render: function() {
		return (
			<div>
				<select>
					{this.availableModules.map(function(s, i) {
						return <option value={i}>{s.name}</option>
					})}
				</select>
				<div className="button" onClick={this.add}>Add</div>
			</div>
		)
	}
});

var PlayButton = React.createClass({
	render: function() {
		return (
			<div className="button" onClick={this.props.playFn} >
				Play
			</div>
		)
	}
});

React.render(
	<Page />,
	document.getElementById('content')
);
