function createNode(element) {
  return document.createElement(element);
}

function append(parent, el) {
  return parent.appendChild(el);
}
function getDate(str) {
  const date = new Date(str)
  return `<span>created at: </span> ${date.getDay()}-${date.getMonth() + 1}-${date.getFullYear()}`;
}
// sort Ascending
function sortAscending(posts) {
  localStorage.setItem(sorting, 'ascending');
  const postsSorted = posts.sort((a, b) => {
    const dateA = new Date(a.createdAt), 
          dateB = new Date(b.createdAt);
    return dateB < dateA ? 1 : -1;
  }); 
  postsFiltered = postsSorted;
  renderPost(postsSorted);
}

// sort descending
function sortDescending(posts) {
  localStorage.setItem(sorting, 'descending');
  const postsSorted = posts.sort((a, b) => {
    const dateA = new Date(a.createdAt), 
          dateB = new Date(b.createdAt);
    return dateB > dateA ? 1 : -1;
  }); 
  postsFiltered = postsSorted;
  renderPost(postsSorted);
}

// sort by tags
let filterTags = [];
document.addEventListener('click', function (event) {
  const el = event.target;
  if(el.classList.contains('tag')) {
    el.classList.toggle('selected');
    postsFiltered = deepClone(posts);
    const tagIngex = filterTags.indexOf(el.id);
    if(tagIngex === -1) {
      filterTags.push(el.id);
    } else {
      filterTags.splice(tagIngex, 1);
    }
    console.warn(filterTags);
    filterTags.map(tag => {
      postsFiltered.map(post => {
        if(post.tags.indexOf(tag) !== -1) {
          post.index = post.index + 1; 
        }
      });
    });
    const sortedTags = postsFiltered
    .sort((a, b) => {
      const dateA = new Date(a.createdAt), 
            dateB = new Date(b.createdAt);
      if (b.index > a.index) {
        return 1;
      } else if (b.index === a.index) {
        return dateB > dateA ? 1 : -1;
      } else {
        return -1;
      }
    })
    .filter(post => post.index !== 0);
    postsFiltered = sortedTags;
    renderPost(sortedTags);
  }

  if(el.classList.contains('close')) {
    const id = el.id;
    const indexFiltered = postsFiltered.map(p => p.id).indexOf(Number(id));
    const index = posts.map(p => p.id).indexOf(Number(id));
    postsFiltered.splice(indexFiltered, 1);
    posts.splice(index, 1);
    console.log(posts, index, indexFiltered, id);
    renderPost(postsFiltered, limit);
  }
});

// scroll
function getDistFromBottom () {
  var scrollPosition = window.pageYOffset;
  var windowSize     = window.innerHeight;
  var bodyHeight     = document.body.offsetHeight;
  return Math.max(bodyHeight - (scrollPosition + windowSize), 0);
}

function scrollTop() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
  const sort = localStorage.getItem(sorting);
  postsFiltered = deepClone(posts);
  limit = 10;
  sort === 'descending' ? sortDescending(postsFiltered) : sortAscending(postsFiltered);
  if(filterTags.length > 0) {
    filterTags.map(id => {
      document.getElementById(id).classList.remove('selected');
    })
  }
  filterTags = [];
}

function renderPost(posts, _limit = 10) {
  while (div.firstChild) {
    div.removeChild(div.firstChild);
  }
  if (_limit > posts.length) {
    _limit = posts.length;
  }
  for (let i = 0; i < _limit; i++) {
    let post = posts[i];
    let h1 = createNode('h1'),
        p = createNode('p'),
        img = createNode('img'),
        tagsWrp = createNode('div'),
        date = createNode('p'),
        close = createNode('i');  
    close.id = post.id;
    close.innerHTML = '&times;';
    close.classList.add('close');
    h1.innerHTML = post.title;
    p.innerHTML = post.description;
    img.src = post.image;
    date.innerHTML = getDate(post.createdAt);
    post.tags.map(function(tag) {
      let span = createNode('span');
      span.innerHTML = tag;
      append(tagsWrp, span);
    });
    tagsWrp.classList.add('tags-wrp');
    date.classList.add('created-at');
    append(div, h1);
    append(div, close);
    append(div, img);
    append(div, p);
    append(div, date);
    append(div, tagsWrp);
    append(wrp, div);
  };
}

const btnTop = document.getElementById('btn-top')
const btnNewest = document.getElementById('btn-newest');
const btnLatest = document.getElementById('btn-latest');
const tagSearch = document.getElementById('tag-search');
const search = document.getElementById('search');
const wrp = document.getElementById('posts');
const url = 'https://api.myjson.com/bins/152f9j';
const sorting = 'sorting';
let limit = 10;
let div = createNode('div');
let posts = [];
let postsFiltered = [];
fetch(url)
  .then((resp) => resp.json())
  .then(function(data) {
    posts = data.data.map((post, i) => ({...post, index: 0, id: i}));    postsFiltered = deepClone(posts);
    // 0 - від меншого до більшого
    // 1 - від більшого до меншого
    const sort = localStorage.getItem(sorting);
    const sortType = sort === null ? 'descending' : sort;
    sortType === 'descending' ? sortDescending(postsFiltered) : sortAscending(postsFiltered);
    let tags = [];
    posts.map(post => {
      post.tags.map(tag => {
        if(tags.indexOf(tag) === -1) {
          tags.push(tag);
        }
      })
    })
    tags.map(tag => {
      const spanTag = createNode('span');
      spanTag.innerHTML = tag;
      spanTag.id = tag;
      spanTag.classList.add('tag');
      append(tagSearch, spanTag);
    });
  })
  .catch(function(error) {
  console.log(JSON.stringify(error));
  });  

  // let indexes = [{value: 2, post: {title...}}, {}] 
  
// Events Listeners
btnTop.addEventListener('click', scrollTop);
btnNewest.addEventListener('click', () => sortDescending(postsFiltered));
btnLatest.addEventListener('click', () => sortAscending(postsFiltered));
search.addEventListener('input', function(event){
  postsFiltered = deepClone(posts).filter(post => post.title.includes(this.value)); 
  renderPost(postsFiltered);
});
document.addEventListener('scroll', function() {
  if(getDistFromBottom() < 50){
    renderPost(postsFiltered, limit);
    limit = limit + 10;
  }
});
function deepClone(arr) {
  return JSON.parse(JSON.stringify(arr))
}