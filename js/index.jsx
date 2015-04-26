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

	addNewOsc: function(e) {
		e.preventDefault();
		var modules = this.state.modules
		var m = {
			name: 'osc',
			properties: {wave:'sin', freq:500, phase:0, fb:0},
		}
		m.myT = T(m.name, m.properties);

		modules.push(m);
		var sequence = this.state.sequence;
		if (this.isPlaying()) {
			sequence.append(m.myT);
		}

		this.setState({
			modules: modules,
			sequence: sequence
		});
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
				{this.state.modules.map(function(s, i) {
					return <Module key={i} o={s} id={i} changed={this.oscChanged} />;
				}.bind(this))}
			</div>,
			<div className="button-row">
				<PlusButton addNewOsc={this.addNewOsc} />
				<PlayButton playFn={this.togglePlay} />
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

var PlusButton = React.createClass({
	render: function() {
		return (
			<div id='AddButton' className="button" onClick={this.props.addNewOsc}>
				Add a new oscillator
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
