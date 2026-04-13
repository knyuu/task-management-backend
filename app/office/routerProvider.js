module.exports = [
    { path: "/office/space", router: require('./space/router') },
    { path: "/office/project", router: require('./project/router') },
    { path: "/office/task", router: require('./task/router') },
    { path: "/office/dashboard", router: require('./dashboard/router') },
    { path: "/office/mytasks", router: require('./mytasks/router') },
    { path: "/office/calendar", router: require('./calendar/router') },
    { path: "/office/channel", router: require('./channel/router') },
    { path: "/office/document", router: require('./document/router') },
]
