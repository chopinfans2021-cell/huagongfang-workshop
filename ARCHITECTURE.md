# 架构审查

运行时只有 T1 五条。判定是「按钮对错 + 滴定液位 + 3 秒 QTE」。

- 数据：`data.js`
- 循环：`index.html` 内联逻辑
- 存档键：`huagongfang-save-v1`
- 纯度：`purityIn * (0.75 + 0.25 * control)`
- 售价：`basePrice * market * purityFactor * (salvage ? 0.4 : 1)`
- 日结：库存 ×0.85，房租 8，平安日声望 +1
