const productList = document.querySelector('.productWrap');
const shoppingCartTable = document.querySelector('.shoppingCart-table tbody');
const discardAllBtn = document.querySelector('.discardAllBtn');
const selectBtn = document.querySelector('.productSelect');
const orderInfoBtn = document.querySelector('.orderInfo-btn');

let productsData = [];
let cartsData = [];

// 初始化
function init() {
  getProductList();
  getCartList();
}

init();

// 取得產品列表
function getProductList() {
  axios.get(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/products`)
    .then(function (response) {
      productsData = response.data.products;
      renderProductList();
    })  
}

// 組產品列表字串
function buildProductListHTML(item) {
  return `
  <li class='productCard'>
    <h4 class='productType'>新品</h4>
    <img src='${item.images}' alt=''>
    <a href='#' id='addCardBtn' class='js-addCardBtn' data-id='${item.id}'>加入購物車</a>
    <h3>${item.title}</h3>
    <del class='originPrice'>NT$${toThousands(item.origin_price)}</del>
    <p class='nowPrice'>NT$${toThousands(item.price)}</p>
  </li>`; 
}

// 渲染產品列表
function renderProductList() {
  let str = '';
  productsData.forEach(function(item) {
    str += buildProductListHTML(item);
  })
  productList.innerHTML = str;
}

// 篩選產品列表
selectBtn.addEventListener('change', function (e) {
  const selectBtnCnt = e.target.value;
  if (selectBtnCnt == '全部') {
    renderProductList();
    return;
  }
  let str = '';
  productsData.forEach(function(item) {
    if (item.category == selectBtnCnt) {
      str += buildProductListHTML(item);
    }
    productList.innerHTML = str;
  })
})

// 取得購物車列表
function getCartList() {
  axios.get(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/carts`)
    .then(function (response) {
      cartsData = response.data.carts;
      renderCartList();
      // 渲染總金額
      document.querySelector('.js-total').textContent = toThousands(response.data.finalTotal);
    })  
}

// 渲染購物車列表
function renderCartList() {
  let str = '';
  cartsData.forEach(function(item) {
    str += `
    <tr>
      <td>
          <div class='cardItem-title'>
              <img src='${item.product.images}' alt=''>
              <p>${item.product.title}</p>
          </div>
      </td>
      <td>NT$${toThousands(item.product.origin_price)}</td>
      <td>${item.quantity}</td>
      <td>NT$${toThousands(item.product.price)}</td>
      <td class='discardBtn'>
          <a href='#' class='material-icons' data-id='${item.id}'>
              clear
          </a>
      </td>
    </tr>`
  })
  shoppingCartTable.innerHTML = str;
}

// 新增至購物
productList.addEventListener('click', function (e) {
  e.preventDefault();
  let addCardBtn = e.target.getAttribute('class');
  if (addCardBtn !== 'js-addCardBtn') {
    return;
  }

  let productId = e.target.getAttribute('data-id');
  let itemNum = 1;
  cartsData.forEach(function (item) {
    if (item.product.id === productId) {
      itemNum = item.quantity += 1;
    }
  })

  axios.post(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/carts`, {
    'data': {
      'productId': productId,
      'quantity': itemNum
    }
  })
  .then(function (response) {
    alert('成功加入到購物車！');
    getCartList();
  })
})

// 刪除全部購物車列表
function deleteAllCartList() {
  axios.delete(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/carts`)
  .then(function (response) {
    alert(response.data.message);
    getCartList();
  })
  .catch(function (response) {
    alert('購物車沒有東西');
  })
}
discardAllBtn.addEventListener('click', function (e) {
  e.preventDefault();
  deleteAllCartList();
})

// 刪除指定購物車列表項目
shoppingCartTable.addEventListener('click', function (e) {
  e.preventDefault();
  let cartId = e.target.getAttribute('data-id');
  if ( e.target.nodeName !== 'A' ) {
    return;
  }
  deleteCartItem(cartId);
})
function deleteCartItem(cartId) {
  axios.delete(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/carts/${cartId}`)
  .then(function (response) {
    alert('點選項目已成功刪除！');
    getCartList();
  })
  .catch(function (response) {
    alert('購物車是空的！');
  })
}

// 送出購物車訂單
orderInfoBtn.addEventListener('click', function (e) {
  e.preventDefault();
  const customerName = document.querySelector('#customerName').value;
  const customerPhone = document.querySelector('#customerPhone').value;
  const customerEmail = document.querySelector('#customerEmail').value;
  const customerAddress = document.querySelector('#customerAddress').value;
  const customerTradeWay = document.querySelector('#tradeWay').value;

  if (customerName == '' || customerPhone == '' || customerEmail == '' || customerAddress == '' || customerTradeWay == '') {
    alert('請輸入完整訂單資訊！');
    return;
  }

  if (cartsData == '') {
    alert('購物車沒有商品！')
    return;
  }

  axios.post(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/orders`, {
    "data": {
      "user": {
        "name": customerName,
        "tel": customerPhone,
        "email": customerEmail,
        "address": customerAddress,
        "payment": customerTradeWay
      }
    }
  })
  .then (function (response) {
    alert('訂單成功送出！');
    document.querySelector('#customerName').value = '';
    document.querySelector('#customerPhone').value = '';
    document.querySelector('#customerEmail').value = '';
    document.querySelector('#customerAddress').value = '';
    document.querySelector('#customerTradeWay').value = '';
    getCartList();
  })
})

// 千分位
function toThousands(num) {
  let num_parts = num.toString().split(".");
  num_parts[0] = num_parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return num_parts.join(".");
}

// 表單驗證
const inputs = document.querySelectorAll("input[name],select[data=payment]");
const form = document.querySelector(".orderInfo-form");
const constraints = {
  "姓名": {
    presence: {
      message: "必填欄位"
    }
  },
  "電話": {
    presence: {
      message: "必填欄位"
    },
    length: {
      minimum: 8,
      message: "需超過 8 碼"
    }
  },
  "信箱": {
    presence: {
      message: "必填欄位"
    },
    email: {
      message: "格式錯誤"
    }
  },
  "寄送地址": {
    presence: {
      message: "必填欄位"
    }
  },
  "交易方式": {
    presence: {
      message: "必填欄位"
    }
  },
};

inputs.forEach((item) => {
  item.addEventListener("change", function () {
    
    item.nextElementSibling.textContent = '';
    let errors = validate(form, constraints) || '';
    console.log(errors)

    if (errors) {
      Object.keys(errors).forEach(function (keys) {
        // console.log(document.querySelector(`[data-message=${keys}]`))
        document.querySelector(`[data-message="${keys}"]`).textContent = errors[keys];
      })
    }
  });
});
