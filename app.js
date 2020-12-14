import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled, { ThemeProvider } from 'styled-components';
import { withRouter } from 'react-router-dom';
import { styleTheme } from './styleTheme';
import { postErrorsToServer } from "./actions/errorHandler/errorHandler";
import { logoutRequest, falseLogout, equityUpdateById, activeFieldUpdateById, session_expire, broker_session_expire, socketEquityUpdateById
} from './actions/auth';
import { fetchAllBrokers } from "./actions/brokerActions";
import Notifications from 'react-notify-toast';
import IdleTimer from 'react-idle-timer';
import AppAdminNavBar from "./containers/App/AppAdminNavBar";
// import AppUserNavBar from "./containers/App/AppUserNavBar";
import AppRoutes from './containers/App/AppRoutes';
import AppModal from "./containers/App/AppModal";
import AppNav from './containers/App/AppNav';
import { socket_connection } from "./actions/socket";
import ListOfRoutes from "./util/ListOfRoutes";
import ProxyUrl from "./util/constUrls";
import moment from "moment";
import './App.css';
import Footer from './components/Footer';
// import swp from 'socketio-with-pm2';

import io from 'socket.io-client';
const MainDivList = styled.div`
  // min-height:calc(100vh - 127px)!important;
  @media only screen and (max-width:767px) { 
    // min-height:calc(100vh - 177px)!important;
  }
`;
// let ipGet = swp.getIp();
// let portInst = swp.getInstanceId();

// let socket = io(process.env.REACT_APP_PROXY, {transports: ['websocket', 'polling']});
// let socket = io(process.env.REACT_APP_PROXY, { 'reconnection': true, 'reconnectionDelay': 500, 'reconnectionAttempts': 10, 'transports': ['websocket', 'polling']});
// console.log(process.env.REACT_APP_PROXY);
// console.log(process.env.REACT_APP_SOCKET_URL, 'REACT_APP_SOCKET_URL')
// let socketUrls = `${'http://148.251.129.234:3001'+portInst}`;
// let socket = io(process.env.REACT_APP_PROXY, {transports: ['websocket', 'polling']});
// let socket = io.connect(socketUrls, {'force new connection': true});
// let socket = io.connect(process.env.REACT_APP_SOCKET_URL, {'force new connection': true});
// let socket = io.connect(process.env.REACT_APP_SOCKET_URL, {transports: ['websocket', 'polling']});
let socket = io.connect(process.env.REACT_APP_SOCKET_URL, { 'reconnection': true, 'reconnectionDelay': 500, 'reconnectionAttempts': 100, 'transports': ['websocket', 'polling']});

class App extends Component {
  constructor(props) {
    super(props)
    this.idleTimer = null;

    this.state = {
      isModalActive: false,
      stayLoggedIntime: 180,
      loggedIntime: 180,
      // timeout: (1000 * 60 * 27), // 27 minutes
      timeout: 1620000, // 27 minutes
      // timeout:600000,  // 10 min for testing
      updateEquityTime: 60000,
      updateActiveFieldTime: 180000,
      isMailSent: false,
      allBrokers: [],
      isCurrentUser: false
    }

    this.clearConst = [
      clearInterval(this.props.timeInterval),
      clearInterval(this.props.equityInterval),
      clearInterval(this.props.activeFieldInterval)
    ];
  }

  componentWillMount() {
    this.isAuthenticated = this.props.isAuthenticated;
    this.isAdminAuthenticated = this.props.isAdminAuthenticated;
    this.isBrokerAuthenticated = this.props.allBrokers.isAuthenticated;
    this.isRoute = undefined;
    this.props.fetchAllBrokers();
    let props = this.props;

    // socket.once('connect', () => {
    socket.on('connect', () => {
      console.log('Connection is enstablished !!');
      props.socket_connection(socket);
    });
  }

  // componentDidUpdate(oldprops) {
  //   let newprops = this.props;
  //   this.isAuthenticated = newprops.Auth.isAuthenticated;
  //   this.isAdminAuthenticated = newprops.Admin.isAdminAuthenticated;

  //   if(newprops.allocation != oldprops.allocation){
  //     let selectedLanguage = newprops.allocation.defaultLanguage;
  //     let div = document.querySelectorAll('.appNavDirection');
  //     let ptag = document.querySelectorAll('p');
  //     // let spantag = document.querySelectorAll('span');
  //     localStorage.setItem('lang', selectedLanguage);
  //     if(selectedLanguage== 'arabic'){     
  //       ptag.forEach(element => {
  //         element.style.direction = 'rtl';
  //       });
  //       div.forEach(element => {
  //         element.style.direction = 'rtl';
  //       });
  //       document.querySelector('body').style.textAlign = 'right';
  //     }else{
  //       document.querySelector('body').style.textAlign = 'left';
  //       div.forEach(element => {
  //         element.style.direction = 'ltr';
  //       });
  //       ptag.forEach(element => {
  //         element.style.direction = 'ltr';
  //       });
  //     }
  //   }
  // }

  componentWillReceiveProps(newprops) {
    this.isAuthenticated = newprops.Auth.isAuthenticated;
    this.isAdminAuthenticated = newprops.Admin.isAdminAuthenticated;
    this.isBrokerAuthenticated = newprops.allBrokers.isAuthenticated;
    this.isMonitorAuthenticated = newprops.MonitoringStatus.isMonitorAuthenticated;

    if(this.isAuthenticated && this.isAuthenticated !=this.props.isAuthenticated){
      this.checkCompleteFunc()
    }

    if (newprops.allocation && newprops.allocation != this.props.allocation) {
      // if (newprops.allocation) {
      let selectedLanguage = newprops.allocation.defaultLanguage;
      let div = document.querySelectorAll('.appNavDirection');
      let ptag = document.querySelectorAll('p');
      let floatLeftdiv = document.querySelectorAll('.floatDefaultLeftClass');
      let floatRightdiv = document.querySelectorAll('.floatDefaultRightClass');
      // let spantag = document.querySelectorAll('span');
      localStorage.setItem('lang', selectedLanguage);
      if (selectedLanguage == 'arabic') {
        ptag.forEach(element => {
          element.style.direction = 'rtl';
        });
        // spantag.forEach(element => {
        //   element.style.direction = 'rtl';
        // });
        div.forEach(element => {
          element.style.direction = 'rtl';
        });
        floatRightdiv.forEach(element => {
          element.style.float = 'left';
        });
        floatLeftdiv.forEach(element => {
            element.style.float = 'right';
        });
        // document.querySelector('.floatStyleClass').style.float = 'left';
        document.querySelector('body').style.textAlign = 'right';
        // document.querySelector('body').style.direction = 'rtl';

      } else {
        document.querySelector('body').style.textAlign = 'left';
        div.forEach(element => {
          element.style.direction = 'ltr';
        });
        ptag.forEach(element => {
          element.style.direction = 'ltr';
        });
        floatRightdiv.forEach(element => {
          element.style.float = 'right';
        });
        floatLeftdiv.forEach(element => {
            element.style.float = 'left';
        });

      }
    }
  }

  logout = (isTrue) => {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser !== null) {
      // this.props.logoutRequest();

      this.props.logoutRequest().then(loggedout => {
        this.setState({ updateEquityTime: 0, updateActiveFieldTime: 0 }, () => {
          Promise.all(this.clearConst).then(() => {
            localStorage.clear();
            if (isTrue) {
              this.props.session_expire(true);
            }
            this.props.history.push("/login");
            window.location.reload();
          });
        })
      })
      // this.setState({ updateEquityTime: 0, updateActiveFieldTime: 0 }, () => {
      //   Promise.all(this.clearConst).then(() => {
      //     localStorage.clear();
      //     // this.props.falseLogout();
      //     // this.props.history.push("/login");
      //     // window.location.reload();

      //     if (isTrue) {
      //       this.props.session_expire(true);
      //     }
      //     this.props.history.push("/login");
      //   });
      // })
    } else {
      this.props.falseLogout();
      this.props.history.push('/login');
      window.location.reload();
    }
  }

  // navigation = (isAuthenticated, isAdminAuthenticated, welcomePageStatus) => {
  //   return (
  //     window.location.pathname.includes('admin') ?
  //       <AppAdminNavBar isAdminAuthenticated={isAdminAuthenticated}
  //         isBrokerAuthenticated={this.props.isBrokerAuthenticated}
  //         history={this.props.history}
  //       /> : welcomePageStatus ? '' :
  //         <React.Fragment> {isAuthenticated && <AppUserNavBar />} </React.Fragment>
  //   )
  // }

  navigation = (isAuthenticated, isAdminAuthenticated, welcomePageStatus) => {
    if (window.location.pathname.includes('/admin/login')) {
      return (<React.Fragment></React.Fragment>)
    }
    if (window.location.pathname.includes('admin')) {
      return (
        <AppAdminNavBar
          isAdminAuthenticated={isAdminAuthenticated}
          isBrokerAuthenticated={this.props.isBrokerAuthenticated}
          history={this.props.history}
        />)
    }
    // else {
    //   if (welcomePageStatus || isAuthenticated) {
    //     return (<AppUserNavBar props={this.props} />)
    //   }
    // }
  }

  onActive = (e) => { }

  logoutTimer = (parmStatus) => {
    this.setState({ isModalActive: !this.state.isModalActive });

    this.props.logoutRequest();
    Promise.all(this.clearConst)
      .then(() => {
        localStorage.clear();
        if (this.state.isCurrentUser) {
          this.props.history.push("/login")
          if(!parmStatus){
            this.props.session_expire(true);
          }
        } else {
          if(!parmStatus){
            this.props.broker_session_expire(true);
          }
          this.props.history.push("/brokeradmin/login");
          // localStorage.clear();
        }
      })
  }

  onIdle = () => {
    let {isModalActive} = this.state;
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let broker = JSON.parse(localStorage.getItem('broker'));
    let adminAccessInfo = JSON.parse(localStorage.getItem('adminAccessInfo'));

    let currentPath = this.props.history.location.pathname;

    let isLoginPagePath = false;

    if (this.props.allBrokers.data && this.props.allBrokers.data.length > 0) {
      let brokersData = this.props.allBrokers.data;
      brokersData.forEach((data) => {
        let route = `/${data.brokerName}admin`;
        if (currentPath == route) {
          isLoginPagePath = true;
        }
      })
    }

    if ((currentUser && currentUser.id) && broker == null && adminAccessInfo == null && isLoginPagePath == false && currentPath !== "/brokeradmin/login" && currentPath !== "/login") {
      if(!isModalActive){
        this.toggle(currentUser, null);
      }
    }

    if ((currentUser == null || Object.keys(currentUser).length < 1) && broker !== null && isLoginPagePath == false && adminAccessInfo == null && currentPath !== "/brokeradmin/login" && currentPath !== "/login") {
      if(!isModalActive){
        this.toggle(null, broker);
      }
    }
  }

  // toggle = (currentUser, brokerUser) => {
  toggle = () => {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let brokerUser = JSON.parse(localStorage.getItem('broker'));
    if (currentUser !== null && Object.keys(currentUser).length > 0) {
      this.setState({ isModalActive: !this.state.isModalActive, stayLoggedIntime: this.state.loggedIntime });
      clearInterval(this.timeInterval);
      this.countDown(currentUser, null);
    }

    if (brokerUser !== null) {
      this.setState({ isModalActive: !this.state.isModalActive, stayLoggedIntime: this.state.loggedIntime });
      clearInterval(this.timeInterval);
      this.countDown(null, brokerUser);
    }
  }

  countDown = (currentUser, brokerUser) => {
    this.timeInterval = setInterval(() => {
      if (this.state.stayLoggedIntime == 0 && this.state.isModalActive) {
        this.stopFun()
      } else {
        if (this.state.stayLoggedIntime > 0) {
          this.setState({ stayLoggedIntime: this.state.stayLoggedIntime - 1, isCurrentUser: currentUser !== null ? true : false });
        }
      }
    }, 1000);
  }

  stopFun = () => {
    clearInterval(this.timeInterval);
    this.logoutTimer(false);
  }

  componentWillUnmount() {
    clearInterval(this.props.timeInterval);
    clearInterval(this.props.equityInterval);
    clearInterval(this.props.activeFieldInterval);
    // clearInterval(this.intervalCurrentUser);
  }

  checkCompleteFunc = () => {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser !== null && Object.keys(currentUser).length > 1 
    // && currentUser.launched==1
    ) {
      clearInterval(this.props.timeInterval);
      clearInterval(this.props.equityInterval);
      clearInterval(this.props.activeFieldInterval);
      let self = this.props;

      let socketEquityUser = `equity_current_user-${currentUser.id}`;
      if(socket){
        socket.on(socketEquityUser, (data) => {
          self.socketEquityUpdateById(data);
          // var currentDate = '[' + new Date().toUTCString() + '] ';
          // console.log('received socket data', data, currentDate)
        });
      }

      this.equityInterval = setInterval(() => {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser !== null && currentUser.id) {
          if(socket.connected){
            socket.emit('equity_current_user', {'user_id':currentUser.id});
          }else{
            let currentUserId = currentUser.id;
            self.equityUpdateById(currentUserId);
          }
        }
      }, this.state.updateEquityTime);

      // this.activeFieldInterval = setInterval(() => {
      //   let currentUser = JSON.parse(localStorage.getItem('currentUser'));
      //   if (currentUser !== null && currentUser.id) {
      //     let currentUserId = currentUser.id;
      //     self.activeFieldUpdateById(currentUserId);
      //   }
      // }, this.state.updateActiveFieldTime);
    }


    let currentRoutePath = this.props.location.pathname;

    if (currentRoutePath.indexOf("monitor") === 1) {
      let adminAccessInfo = JSON.parse(localStorage.getItem('adminAccessInfo'));
      // let checkss = '';
      // ListOfRoutes.forEach(content => {
      //   if (content === currentRoutePath) {
      //     checkss = currentRoutePath;
      //   }
      // })
      if (currentUser !== null && Object.keys(currentUser).length > 1) {
        this.props.history.push('/404');
      }
      if (adminAccessInfo !== null && Object.keys(adminAccessInfo).length > 1) {
        this.props.history.push('/404');
      }
    }

    if (currentRoutePath.indexOf("admin") !== -1) {
       
      ListOfRoutes.push(currentRoutePath);

      this.isRoute = ListOfRoutes.find(list => list.includes(currentRoutePath));
      // https://stackoverflow.com/questions/1789945/how-to-check-whether-a-string-contains-a-substring-in-javascript

      if (!this.isRoute) {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser !== null) {
          let user = this.props.Auth.currentUser;
          let errorObject = {
            "user": `${user.id}/${user.terminal_login}/${user.slave_users_brokers[0].terminal_broker}`,
            "url_generates_the_error": `${ProxyUrl}/api`,
            "url_clicked_before": `/404 route error`,
            "date_time": moment().tz('UTC').format('LLLL')
          };

          this.props.postErrorsToServer(errorObject);
        }
        this.props.history.push('/404');
      }

    } else {
      this.isRoute = ListOfRoutes.find(list => list.includes(currentRoutePath));

      if (!this.isRoute) {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser !== null) {
          let user = this.props.Auth.currentUser;

          let errorObject = {
            "user": `${user.id}/${user.terminal_login}/${user.slave_users_brokers[0].terminal_broker}`,
            "url_generates_the_error": `${ProxyUrl}/api`,
            "url_clicked_before": `/404 route error`,
            "date_time": moment().tz('UTC').format('LLLL')
          };

          this.props.postErrorsToServer(errorObject);
        }
        this.props.history.push('/404');
      }
    }

    let isError = localStorage.getItem('isError');
    if (isError == 'true') {
      localStorage.clear();
    }
  }

  componentDidMount() { this.checkCompleteFunc()}

  render() {
    let adminMatchedRoute = false;
    let brokeradminMatchedRoute = false;
    let userMatchedRoute = false;
    if (this.isAuthenticated === undefined) {
      this.isAuthenticated = this.props.Auth.isAuthenticated
    }
    if (this.isAdminAuthenticated === undefined) {
      this.isAdminAuthenticated = this.props.Admin.isAdminAuthenticated
    }
    if (this.isMonitorAuthenticated === undefined) {
      this.isMonitorAuthenticated = this.props.Admin.isMonitorAuthenticated
    }

    if (this.isBrokerAuthenticated === undefined) {
      this.isBrokerAuthenticated = this.props.allBrokers.isAuthenticated
    }
    if (this.props) {
      if(this.props.allBrokers && (this.props.allBrokers.data && this.props.allBrokers.data.length>0)){
        let {location, allBrokers} = this.props;
        let brokerRouteList = (allBrokers.data).map((data) => `/${data.brokerName}admin`);
        let allRoutes = (brokerRouteList.length>0) ? [...ListOfRoutes, ...brokerRouteList] : ListOfRoutes;
        let pathcheck = (location.search!='') ? `${location.pathname}${location.search}` : `${location.pathname}`;
        let hasAccess = allRoutes.includes(pathcheck);
        if(!hasAccess){
          let ignorePath = ['/404', '/something-went-wrong'];
          if(!ignorePath.includes(location.pathname)){
            if(location.pathname!='/404'){
              this.props.history.push('/404');
            }else if(location.pathname!='/something-went-wrong'){
              this.props.history.push('/something-went-wrong');
            }
          }
        }
      }
      let text = this.props.location.pathname;
      // text = text.split('/');
      text = text.split('/').filter(data => data!='');
      if (text.includes('brokeradmin')) {
        brokeradminMatchedRoute = true;
      } else if (text.includes('admin')) {
        adminMatchedRoute = true;
      } else {
        let brokersData = this.props.allBrokers.data;
        userMatchedRoute = (brokersData && brokersData.length===0) && true;
        if(brokersData && brokersData.length>0){
          let routeList = brokersData.map((data) => `${data.brokerName}admin`);
          let matchedRoutes = routeList.filter(element => text.includes(element));
          if(matchedRoutes && matchedRoutes.length>0){
            brokeradminMatchedRoute = true;
          }else{
            userMatchedRoute = true;
          }
        }
      }
    }

    if (this.isAuthenticated === true) {
      this.authenticated = true;
    } else {
      this.authenticated = false;
    }

    let welcomePageStatus;
    if (this.props.Auth && this.props.Auth.currentUser && this.props.Auth.currentUser.allocation && this.props.Auth.currentUser.allocation) {
      welcomePageStatus = (this.props.Auth.currentUser && this.props.Auth.currentUser.allocation.welcomePageStatus == 1) ? true : false;
    } else {
      welcomePageStatus = false;
    }

    if (this.props.Auth && this.props.Auth.currentUser) {
      if (this.props.Auth.isAuthenticated) {
        localStorage.setItem('currentUser', JSON.stringify(this.props.Auth.currentUser));
      }
    } else {
      Promise.all([this.props.falseLogout()])
        .then(() => {
          this.props.history.push('/login');
        });
    }

    return (
      <React.Fragment>
        <IdleTimer
          ref={ref => { this.idleTimer = ref }}
          element={document}
          onActive={this.onActive}
          startOnMount={true}
          onIdle={this.onIdle}
          timeout={this.state.timeout}
        />
        <Notifications />
        <ThemeProvider theme={styleTheme}>
          <React.Fragment>
            <MainDivList>
              <AppNav
                navigation={this.navigation}
                logout={this.logout}
                AuthChild={this.props.Auth}
                isAuthenticated={this.isAuthenticated}
                welcomePageStatus={welcomePageStatus}
                isAdminAuthenticated={this.isAdminAuthenticated}
                brokeradminMatchedRoute={brokeradminMatchedRoute}
                adminMatchedRoute={adminMatchedRoute}
                userMatchedRoute={userMatchedRoute}
              />

              <AppRoutes
                allBrokers={this.props.allBrokers}
                authenticated={this.authenticated}
                isAdminAuthenticated={this.isAdminAuthenticated}
                isMonitorAuthenticated={this.isMonitorAuthenticated}
                {...this.props}
              />
              {((userMatchedRoute && this.isAuthenticated) || (brokeradminMatchedRoute && this.isBrokerAuthenticated)) &&
                <AppModal
                  isCurrentUser={this.state.isCurrentUser}
                  toggle={() => {this.toggle()}}
                  logoutTimer={(parm)=> {this.logoutTimer(parm)}}
                  isModalActive={this.state.isModalActive}
                  stayLoggedIntime={this.state.stayLoggedIntime}
                />
              }
            </MainDivList>

            {(brokeradminMatchedRoute && this.isBrokerAuthenticated) && <Footer  {...this.props} />}
            {(adminMatchedRoute && this.isAdminAuthenticated) && <Footer {...this.props} />}
            {(userMatchedRoute && this.isAuthenticated) && <Footer  {...this.props} />}
            {( window.location.pathname === "/direct" ) &&  <Footer  {...this.props} />}
          </React.Fragment>
        </ThemeProvider>
        {/* </IdleTimer> */}
      </React.Fragment>
    );
  }
}

const mapState = (state) => {
  return {
    Auth: state.Auth,
    Admin: state.Admin,
    MonitoringStatus: state.MonitoringStatus,
    isMonitorAuthenticated: state.MonitoringStatus.isMonitorAuthenticated,
    isAuthenticated: state.Auth.isAuthenticated,
    isAdminAuthenticated: state.Admin.isAdminAuthenticated,
    isBrokerAuthenticated: state.Broker.isAuthenticated,
    allBrokers: state.Broker,
    allocation: state.Allocation.data
  };
}

const mapDispatch = (dispatch) => {
  return {
    postErrorsToServer: (data) => { dispatch(postErrorsToServer(data)) },
    logoutRequest: () => { return dispatch(logoutRequest()) },
    falseLogout: () => { dispatch(falseLogout()) },
    equityUpdateById: (data) => { dispatch(equityUpdateById(data)) },
    activeFieldUpdateById: (data) => { dispatch(activeFieldUpdateById(data)) },
    fetchAllBrokers: () => { dispatch(fetchAllBrokers()) },
    socket_connection: (data) => { dispatch(socket_connection(data)) },
    session_expire: (isExpire) => { dispatch(session_expire(isExpire)) },
    broker_session_expire: (isExpire) => { dispatch(broker_session_expire(isExpire)) },
    socketEquityUpdateById: (data) => { dispatch(socketEquityUpdateById(data)) }
  }
}

export default withRouter(connect(mapState, mapDispatch)(App));