var moduleDefinitions = {
	osc: {
		wave: {
			type: 'list',
			values: ['sin','cos','pulse','saw','tri','fami','konami'],
			initial: 'sin',
		},
		freq: {
			type: 'integer',
			min: 0,
			max: 2600,
			step: 1,
			initial: 500,
		}
	},
	noise: {
		mul: {
			type: 'integer',
			initial: 1,
		},
		add: {
			type: 'integer',
			initial: 0,
		},
	},
};

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
						return <Module key={i} mod={s} id={i} changed={this.oscChanged} />;
					}.bind(this))}
				</div>
			</div>
		);
	}
});

var Module = React.createClass({
	changed: function() {
		// for each prop
		for (tPropName in this.props.mod.properties) {
			var tPropValue = $(this.getDOMNode()).find('.' + tPropName).val()
			//TODO: add variable parsing
			switch(moduleDefinitions[this.props.mod.name][tPropName].type) {
				case 'integer':
					console.dir(tPropValue);
					tPropValue = parseInt(tPropValue);
				default:
					tPropValue = tPropValue
					break;
			}

			this.props.mod.properties[tPropName] = tPropValue;
		}

		if (this.props.mod.myT != null) {
			this.props.mod.myT.set(this.props.mod.properties);
		}

		this.props.changed(this.props.id, this.props.mod);
	},
	render: function() {
		var controls = [];
		for (prop in moduleDefinitions[this.props.mod.name]) {
			var def = moduleDefinitions[this.props.mod.name][prop];
			if (def['type'] == 'list') {
				controls.push(
					<select className={prop} onChange={this.changed} value={this.props.mod.properties[prop]}>
						{def.values.map(function(s, i) {
							return <option value={s}>{s}</option>
						})}
					</select>
				);
			} else if (def['type'] == 'integer') {
				controls.push(<input className={prop} type='range' min={def.min} max={def.max} step={def.step} onChange={this.changed} />)
			}
		}

		return (
			<div className='module'>
				<h2>{this.props.mod.name}</h2>
				{controls}
			</div>
		);
	}
});

var ModuleSelector = React.createClass({
	// TODO: just make this a list like ['osc', 'noise'] and use the
	// moduleDefintions schema to define the default values
	availableModules: [
		{
			name: 'osc',
			properties: {wave:'sin', freq:500}
		},
		{
			name: 'noise',
			properties: {mul:1, add:0}
		},
		{
			name: 'lowpass',
			properties: {cutoff: 300, res: 1}
		},
		{
			name: 'highpass',
			properties: {cutoff: 900, res: 1}
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
