const orderList = document.querySelector('.js-oderList');
const discardAllBtn = document.querySelector('.discardAllBtn');

let orderData = [];

// 初始化
function init() {
  getOrderList();
}

init();

// 組 C3 資料
function renderC3() {
  // 搜集資料
  let total = {};

  orderData.forEach(function (item) {
    item.products.forEach(function (productsItem) {
      if (total[productsItem.title] == undefined) {
        total[productsItem.title] = productsItem.price * productsItem.quantity;
      } else {
        total[productsItem.title] += productsItem.price * productsItem.quantity;
      }
    })
  })

  // 整理資料
  let categoryAry = Object.keys(total);
  let newData = [];

  categoryAry.forEach(function (item) {
    let ary = [];
    ary.push(item);
    ary.push(total[item]);
    newData.push(ary);
  })

  // 由大到小排序
  newData.sort(function (a, b) {
    return b[1] - a[1];
  })
  
  // 第四項以後歸類其他分類
  if (newData.length > 3) {
    console.log(newData);
    let otherTotal = 0;
    newData.forEach(function (item, index) {
      if (index > 2) {
        otherTotal += newData[index][1];
      }
    })
    newData.splice(3);
    newData.push(['其他', otherTotal]);
  }

  // C3.js
  let chart = c3.generate({
    bindto: '#chart', // HTML 元素綁定
    data: {
        type: "pie",
        columns: newData
        // colors: {
        //     "Louvre 雙人床架":"#DACBFF",
        //     "Antony 雙人床架":"#9D7FEA",
        //     "Anty 雙人床架": "#5434A7",
        //     "其他": "#301E5F",
        // }
    }
  });
}

// 取得訂單列表
function getOrderList() {
  axios.get(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/${api_path}/orders`, {
    headers: {
      'authorization': token
    }
  })
  .then(function (response) {
    orderData = response.data.orders;
    let str = '';
    orderData.forEach(function (item) {
      // 組時間字串
      const timeStamp = new Date(item.createdAt * 1000);
      const orderTime = `${timeStamp.getFullYear()}/${timeStamp.getMonth()+1}/${timeStamp.getDate()}`;
      // 組產品名稱字串
      let productStr = '';
      item.products.forEach(function (productItem) {
        productStr += `<p>${productItem.title} x${productItem.quantity}</p>`;
      })
      // 訂單狀態字串判斷
      let orderStatus = '';
      if (!!item.paid) {
        orderStatus = '已處理';
      } else {
        orderStatus = '未處理';
      }
      // 組訂單列表字串
      str += `
      <tr>
        <td>10088377474</td>
        <td>
          <p>${item.user.name}</p>
          <p>${item.user.tel}</p>
        </td>
        <td>${item.user.address}</td>
        <td>${item.user.email}</td>
        <td>
          ${productStr}
        </td>
        <td>${orderTime}</td>
        <td class="js-orderStatus">
          <a href="#" class="orderStatus" data-id="${item.id}" data-status="${item.paid}">${orderStatus}</a>
        </td>
        <td>
          <input type="button" class="delSingleOrder-Btn js-orderDelete" data-id="${item.id}" value="刪除">
        </td>
      </tr>`
    })
    orderList.innerHTML = str;

    renderC3();
  })
}

// 判斷點擊狀態或刪除
orderList.addEventListener('click', function (e) {
  e.preventDefault();
  const targetClass = e.target.getAttribute('class');
  let id = e.target.getAttribute('data-id');
  // 點擊狀態時邏輯
  if (targetClass == 'orderStatus') {
    let status = e.target.getAttribute('data-status');
    changeItemStatus(status, id);
    return;
  }
  // 點擊刪除時邏輯
  if (targetClass == 'delSingleOrder-Btn js-orderDelete') {
    deleteOrderItem(id);
    return;
  }
})

// 訂單狀態修改邏輯
function changeItemStatus(status, id) {
  let newStatus = '';
  if (!!status) {
    newStatus = true;
  } else {
    newStatus = false;
  }

  axios.put(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/${api_path}/orders`, {
  'data': {
    'id': id,
    'paid': newStatus
  }
  },{
    headers: {
      'authorization': token
    }
  })
  .then(function (response) {
    alert('更改訂單資料狀態成功！');
    getOrderList();
  })
}

// 刪除訂單資料
function deleteOrderItem(id) {
  axios.delete(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/${api_path}/orders/${id}`, {
    headers: {
      'authorization': token
    }
  })
  .then(function (response) {
    alert('刪除該筆訂單成功！');
    getOrderList();
  })
}

// 刪除全部訂單資料
discardAllBtn.addEventListener('click', function (e) {
  e.preventDefault();
  axios.delete(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/${api_path}/orders`, {
    headers: {
      'authorization': token
    }
  })
  .then(function (response) {
    alert('刪除全部訂單成功！');
    getOrderList();
  })  
})