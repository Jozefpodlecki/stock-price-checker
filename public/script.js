const [ getStockForm, getStocksForm ] = document.forms;
const stockResult = document.getElementById('stockResult');
const stocksResult = document.getElementById('stocksResult');
const hljs = window.hljs || {};
const url = window.url;

getStockForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const searchParams = new URLSearchParams();
  const elements = form.elements;
  
  searchParams.append("like", elements.like.checked)
  searchParams.append("stock", elements.stock.value)
  
  const queryString = searchParams.toString()
  
  fetch(`${url}api/stock-prices?${queryString}`)
    .then(response => response.text())
    .then(text => {
      stockResult.innerText = text;
      hljs.highlightBlock(stockResult);
    })
    .catch(text => {
      stockResult.innerText = text;
      hljs.highlightBlock(stockResult);
    })
})

getStocksForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const searchParams = new URLSearchParams();
  const elements = form.elements;
  
  searchParams.append("stock", elements.firstStock.value);
  searchParams.append("stock", elements.secondStock.value);
  searchParams.append("like", elements.like.checked);
  
  const queryString = searchParams.toString()

  fetch(`${url}api/stock-prices?${queryString}`)
    .then(response => response.text())
    .then(text => {
      stocksResult.innerText = text;
      hljs.highlightBlock(stocksResult);
    })
    .catch(error => {
      stocksResult.innerText = error;
      hljs.highlightBlock(stocksResult);
    })
})