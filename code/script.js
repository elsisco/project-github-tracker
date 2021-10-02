let repoName = 'project-weather-app'

const API_REPOS = `https://api.github.com/users/elsisco/repos`
const API_USER = `https://api.github.com/users/elsisco`
const API_PR = `https://api.github.com/repos/technigo/${repoName}/pulls`


const projectsContainer = document.getElementById('projects')
const profileContainer = document.getElementById('profile')

const getUser = () => {
    fetch(API_USER)
        .then(res => res.json())
        .then(data => {
            // Profile content
            profileContainer.innerHTML += /*html*/ `
                <div class="user-wrapper">
                    <div class="avatar-wrapper">
                        <img class="avatar" src="${data.avatar_url}"/>
                    </div>
                    <div class="project-headline">${data.name}</div>
                    <div class="thin-headline">${data.login}</div>
                    <p class="links-text"><a href="${data.html_url}">GitHub profile ➔</a></p>
                    <div class="location">
                        <img src="./assets/location_icon.svg">
                        <div class="text">${data.location}</div>
                    </div>
                    <div class="text">${data.bio}</div>
                </div>
            `
        })
}

const getRepos = () => {
    fetch(API_REPOS)
        .then(res => res.json())
        .then(data => {
            // Filtering the Technigo project repos
            const forkedRepos = data.filter(repo => repo.fork && repo.name.startsWith('project-'))

            // Sort array in alphabetical order
            const sortedRepos = forkedRepos.sort()
            
            sortedRepos.forEach(repo =>
                fetch(`https://api.github.com/repos/elsisco/${repo.name}/commits`)
                    .then(res => res.json())
                    .then(data => {
                        // Formatting the title of projects to start all words with capital letter
                        let projectName = `${repo.name}`
                        const formattedProjectName = projectName.split("-")
                        for (let i = 0; i < formattedProjectName.length; i++) {
                            formattedProjectName[i] = formattedProjectName[i][0].toUpperCase() + formattedProjectName[i].substr(1);
                        }
                        let newProjectName = formattedProjectName.join(" ")
                        
                        // Date for most recent update of project
                        let latestCommit = new Date(repo.pushed_at).toLocaleString("en-ZA", { dateStyle: 'short' })

                        // Adding content to the projects
                        projectsContainer.innerHTML += /*html*/ `
                        <div class="project-card" id="${repo.name}">
                            <div class="project-headline">${newProjectName}</div>
                            <p class="links-text"><a href="${repo.html_url}">GitHub repository ➔</a> | <a href="${repo.homepage}">View it live ➔</a></p>
                            <p class="text">Most recent edit: ${latestCommit}</p>
                            <p class="text">Default branch: ${repo.default_branch}</p>
                            <p id="commits-${repo.name}" class="text">(commits yet to be displayed)</p>
                            <div class="languages">
                                <p class="small-headline">Languages</p>

                                <div id="progress-${repo.name}" class="progress"></div>
                                
                                <section class="the-languages">
                                    <div class="html-wrapper">
                                        <div class="language-dot" style="background-color:#56B093;"></div>
                                        <div class="language-text">HTML</div>
                                    </div>
                                    <div class="css-wrapper">
                                        <div class="language-dot" style="background-color:#EBBC4E;"></div>
                                        <div class="language-text">CSS</div>
                                        </div>
                                    <div class="js-wrapper">
                                        <div class="language-dot" style="background-color:#F59B99;"></div>
                                        <div class="language-text">JavaScript</div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    `
                    calculateLanguagePercentage(repo)  
                    })
            )
            fetchPullRequestsArray(forkedRepos);
            drawChart(forkedRepos.length)
        })
}

// A calculator for language percentage per project
const calculateLanguagePercentage = (repo) => {
    fetch(`https://api.github.com/repos/elsisco/${repo.name}/languages`)
        .then(res => res.json())
        .then(language => {
            const html = language.HTML || 0;
            const css = language.CSS || 0;
            const js = language.JavaScript || 0;
            const sum = html + css + js;

            const htmlPercentage = ((html / sum) * 100).toFixed(1);
            const cssPercentage = ((css / sum) * 100).toFixed(1);
            const jsPercentage = ((js / sum) * 100).toFixed(1);

            document.getElementById(`progress-${repo.name}`).innerHTML = /*html*/ `
                <div class="progress-html" style="width:${htmlPercentage}%;"></div>
                <div class="progress-css" style="width:${cssPercentage}%;"></div>
                <div class="progress-js" style="width:${jsPercentage}%;"></div>
            `
        })
}

const fetchPullRequestsArray = (allRepositories) => {
    allRepositories.forEach(repo => {
        fetch(`https://api.github.com/repos/Technigo/${repo.name}/pulls?per_page=100`)
            .then(res => res.json())
            .then((data) => {
                const myPullRequests = data.find((pull) => pull.user.login === repo.owner.login)
                fetchCommits(myPullRequests.commits_url, repo.name)
                // if (myPullRequests) {
                //     fetchCommits(myPullRequests.commits_url, repo.name)
                // } else {
                //     document.getElementById(`commit-${repo.name}`).innerHTML +=
				// 		'No commits yet';
                // }
            })
    })
}

const fetchCommits = (myCommitsUrl, myRepoName) => {
    fetch(myCommitsUrl)
        .then(res => res.json())
        .then((data) => {
            document.getElementById(`commits-${myRepoName}`).innerHTML = `${data.length} commits`
        })
}

getUser()

getRepos()