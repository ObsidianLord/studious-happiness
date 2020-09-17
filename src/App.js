import React from 'react';
import bridge from '@vkontakte/vk-bridge';
import View from '@vkontakte/vkui/dist/components/View/View';
import '@vkontakte/vkui/dist/vkui.css';

import Home from './panels/Home';
import Persik from './panels/Persik';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      activePanel: 'home',
      history: []
    };

    const state = this.state;
    const changeActivePanel = this.changeActivePanel.bind(this);
    window.onpopstate = function(event) {
      if (state.history.length > 0) {
        changeActivePanel('back');
      }
    }

    this.go = this.go.bind(this);
  }

  changeActivePanel(toPanel) {
    if (toPanel === 'back') {
      const previousPanel = this.state.history.pop();
      this.setState({
          activePanel: previousPanel
      });
    } else {
      this.state.history.push(this.state.activePanel);
      window.history.pushState({}, '');
      this.setState({
          activePanel: toPanel
      });
    }
  }

  go(event) {
    const toPanel = event.currentTarget.dataset.to;
    this.changeActivePanel(toPanel);
  }

  componentDidMount() {
    bridge.subscribe(({ detail: { type, data }}) => {
      if (type === 'VKWebAppUpdateConfig') {
        const schemeAttribute = document.createAttribute('scheme');
        schemeAttribute.value = data.scheme ? data.scheme : 'client_light';
        document.body.attributes.setNamedItem(schemeAttribute);
        const status_bar = schemeAttribute.value.includes('light') ? 'dark' : 'light';
        bridge.send('VKWebAppSetViewSettings', {'status_bar_style': status_bar});
      }
    });
    // async function fetchData() {
    //     const user = await bridge.send('VKWebAppGetUserInfo');
    //     setUser(user);
    //     setPopout(null);
    // }
    // fetchData();
  }

  render() {
    return (
      <View activePanel={this.state.activePanel}>
        <Home id='home' go={this.go} />
        <Persik id='persik' go={this.go} />
      </View>
    )
  }
}

export default App;
