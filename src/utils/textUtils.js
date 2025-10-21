// 简繁体转换工具
// 舰娘名称拼音映射表（常见舰娘名称）
const SHIP_NAME_PINYIN = {
  // 驱逐舰
  '吹雪': ['chuixue', 'cx'],
  '白雪': ['baixue', 'bx'],
  '深雪': ['shenxue', 'sx'],
  '矶波': ['jibo', 'jb'],
  '绫波': ['lingbo', 'lb'],
  '敷波': ['fubo', 'fb'],
  '曙': ['shu'],
  '潮': ['chao', 'c'],
  '响': ['xiang', 'x'],
  '雷': ['lei', 'l'],
  '电': ['dian', 'd'],
  '晓': ['xiao', 'x'],
  '时雨': ['shiyu', 'sy'],
  '村雨': ['cunyu', 'cy'],
  '夕立': ['xili', 'xl'],
  '五月雨': ['wuyueyu', 'wyy'],
  '凉风': ['liangfeng', 'lf'],
  '朝潮': ['chaochao', 'cc'],
  '大潮': ['dachao', 'dc'],
  '满潮': ['manchao', 'mc'],
  '荒潮': ['huangchao', 'hc'],
  '阳炎': ['yangyan', 'yy'],
  '不知火': ['buzhihuo', 'bzh'],
  '黑潮': ['heichao', 'hc'],
  '雪风': ['xuefeng', 'xf'],
  '初风': ['chufeng', 'cf'],
  '天津风': ['tianjinfeng', 'tjf'],
  '时津风': ['shijinfeng', 'sjf'],
  '浦风': ['pufeng', 'pf'],
  '矶风': ['jifeng', 'jf'],
  '滨风': ['binfeng', 'bf'],
  '谷风': ['gufeng', 'gf'],
  '野分': ['yefen', 'yf'],
  '嵐': ['lan'],
  '萩风': ['qiufeng', 'qf'],
  '舞风': ['wufeng', 'wf'],
  '秋云': ['qiuyun', 'qy'],
  '夕云': ['xiyun', 'xy'],
  '巻云': ['juanyun', 'jy'],
  '长波': ['changbo', 'cb'],
  '高波': ['gaobo', 'gb'],
  
  // 轻巡洋舰
  '天龙': ['tianlong', 'tl'],
  '龙田': ['longtian', 'lt'],
  '球磨': ['qiumo', 'qm'],
  '多摩': ['duomo', 'dm'],
  '木曾': ['muceng', 'mc'],
  '长良': ['changliang', 'cl'],
  '五十铃': ['wushiling', 'wsl'],
  '名取': ['mingqu', 'mq'],
  '由良': ['youliang', 'yl'],
  '鬼怒': ['guinu', 'gn'],
  '阿武隈': ['awuwei', 'aww'],
  '川内': ['chuannei', 'cn'],
  '神通': ['shentong', 'st'],
  '那珂': ['nake', 'nk'],
  '阿贺野': ['aheye', 'ahy'],
  '能代': ['nengdai', 'nd'],
  '矢矧': ['shishen', 'ss'],
  '酒匂': ['jiuxiong', 'jx'],
  '大淀': ['dadian', 'dd'],
  
  // 重巡洋舰
  '古鹰': ['guying', 'gy'],
  '加古': ['jiagu', 'jg'],
  '青叶': ['qingye', 'qy'],
  '衣笠': ['yili', 'yl'],
  '妙高': ['miaogao', 'mg'],
  '那智': ['nazhi', 'nz'],
  '足柄': ['zuxiang', 'zx'],
  '羽黑': ['yuhei', 'yh'],
  '高雄': ['gaoxiong', 'gx'],
  '爱宕': ['aituo', 'at'],
  '摩耶': ['moye', 'my'],
  '鸟海': ['niaohai', 'nh'],
  '最上': ['zuishang', 'zs'],
  '三隈': ['sanwei', 'sw'],
  '铃谷': ['linggu', 'lg'],
  '熊野': ['xiongye', 'xy'],
  '筑摩': ['zhumo', 'zc'],
  '利根': ['ligen', 'lg'],
  
  // 战列舰
  '金刚': ['jingang', 'jg'],
  '比叡': ['biei', 'be'],
  '榛名': ['zhenming', 'zm'],
  '雾岛': ['wudao', 'wd'],
  '扶桑': ['fusang', 'fs'],
  '山城': ['shancheng', 'sc'],
  '伊势': ['yishi', 'ys'],
  '日向': ['rixiang', 'rx'],
  '长门': ['changmen', 'cm'],
  '陆奥': ['luao', 'la'],
  '大和': ['dahe', 'dh'],
  '武藏': ['wuzang', 'wz'],
  
  // 正规空母
  '凤翔': ['fengxiang', 'fx'],
  '赤城': ['chicheng', 'cc'],
  '加贺': ['jiaga', 'jg'],
  '苍龙': ['canglong', 'cl'],
  '飞龙': ['feilong', 'fl'],
  '翔鹤': ['xianghe', 'xh'],
  '瑞鹤': ['ruihe', 'rh'],
  '大凤': ['dafeng', 'df'],
  '云龙': ['yunlong', 'yl'],
  '天城': ['tiancheng', 'tc'],
  '葛城': ['gecheng', 'gc'],
  
  // 轻空母
  '凤翔': ['fengxiang', 'fx'],
  '龙骧': ['longrang', 'lr'],
  '飞鹰': ['feiying', 'fy'],
  '隼鹰': ['sunying', 'sy'],
  '祥凤': ['xiangfeng', 'xf'],
  '瑞凤': ['ruifeng', 'rf'],
  '龙凤': ['longfeng', 'lf'],
  '千岁': ['qiansui', 'qs'],
  '千代田': ['qiandaitian', 'qdt'],
  '神鹰': ['shenying', 'sy'],
  
  // 潜水舰
  '伊168': ['yi168', 'y168', 'i168'],
  '伊58': ['yi58', 'y58', 'i58'],
  '伊8': ['yi8', 'y8', 'i8'],
  '伊19': ['yi19', 'y19', 'i19'],
  '伊401': ['yi401', 'y401', 'i401'],
  
  // 其他
  '明石': ['mingshi', 'ms'],
  '大鲸': ['dajing', 'dj'],
  '间宫': ['jiangong', 'jg'],
  '伊良湖': ['yilianghu', 'ylh'],
  
  // 海外舰娘
  'Bismarck': ['bismark', 'bsm', 'b'],
  'Prinz Eugen': ['prinzeugen', 'peg', 'pe'],
  'Z1': ['z1'],
  'Z3': ['z3'],
  'Ro-500': ['ro500', 'r500'],
  'Iowa': ['iowa', 'iw'],
  'Warspite': ['warspite', 'ws'],
  'Littorio': ['littorio', 'lt'],
  'Roma': ['roma', 'rm'],
  'Libeccio': ['libeccio', 'lb'],
  'Aquila': ['aquila', 'aq'],
  'Graf Zeppelin': ['grafzeppelin', 'gz'],
  'Saratoga': ['saratoga', 'sg'],
  'Intrepid': ['intrepid', 'it'],
  'Richelieu': ['richelieu', 'rc'],
  'Jean Bart': ['jeanbart', 'jb'],
  'Commandant Teste': ['commandantteste', 'ct'],
  'Gotland': ['gotland', 'gt'],
  'Nelson': ['nelson', 'nl'],
  'Rodney': ['rodney', 'rd'],
  'Ark Royal': ['arkroyal', 'ar'],
  'Jervis': ['jervis', 'jv'],
  'Janus': ['janus', 'js'],
  'Tashkent': ['tashkent', 'tk'],
  'Gangut': ['gangut', 'gg'],
  'Hibiki': ['hibiki', 'hb'],
  'Verniy': ['verniy', 'vn'],
  'Zara': ['zara', 'za'],
  'Pola': ['pola', 'pl'],
  'Maestrale': ['maestrale', 'ms'],
  'Grecale': ['grecale', 'gc'],
  'Scirocco': ['scirocco', 'sc'],
  'Fletcher': ['fletcher', 'fc'],
  'Johnston': ['johnston', 'jt'],
  'Samuel B. Roberts': ['samuelbroberts', 'sbr'],
  'Gambier Bay': ['gambierbay', 'gb'],
  'Perth': ['perth', 'pt'],
  'De Ruyter': ['deruyter', 'dr'],
  'Houston': ['houston', 'ht'],
  'Atlanta': ['atlanta', 'at'],
  'Honolulu': ['honolulu', 'hl'],
  'Helena': ['helena', 'hl'],
  'South Dakota': ['southdakota', 'sd'],
  'Washington': ['washington', 'wt'],
  'Colorado': ['colorado', 'cl'],
  'Maryland': ['maryland', 'md'],
  'Hornet': ['hornet', 'ht'],
  'Shangri-La': ['shangrila', 'sl'],
  'Luigi Torelli': ['luigitorelli', 'lt'],
  'UIT-25': ['uit25', 'u25'],
  'I-504': ['i504'],
  'Tan Yang': ['tanyang', 'ty'],
  'Yukikaze': ['yukikaze', 'yk']
}

// 常用的舰娘名称简繁体对照表
const SIMPLIFIED_TO_TRADITIONAL = {
  // 常见字符
  '龙': '龍', '凤': '鳳', '雾': '霧', '电': '電', '雷': '雷', '晓': '曉',
  '响': '響', '雪': '雪', '白': '白', '黑': '黑', '赤': '赤', '青': '青',
  '绿': '綠', '金': '金', '银': '銀', '铜': '銅', '铁': '鐵', '钢': '鋼',
  '炮': '砲', '舰': '艦', '船': '船', '海': '海', '洋': '洋', '岛': '島',
  '山': '山', '川': '川', '河': '河', '湖': '湖', '风': '風', '云': '雲',
  '雨': '雨', '雪': '雪', '霜': '霜', '雾': '霧', '露': '露', '冰': '冰',
  '火': '火', '水': '水', '木': '木', '土': '土', '石': '石', '沙': '沙',
  '花': '花', '草': '草', '树': '樹', '林': '林', '森': '森', '竹': '竹',
  '松': '松', '梅': '梅', '樱': '櫻', '桃': '桃', '李': '李', '杏': '杏',
  '春': '春', '夏': '夏', '秋': '秋', '冬': '冬', '月': '月', '日': '日',
  '星': '星', '空': '空', '天': '天', '地': '地', '人': '人', '女': '女',
  '男': '男', '老': '老', '少': '少', '大': '大', '小': '小', '高': '高',
  '低': '低', '长': '長', '短': '短', '宽': '寬', '窄': '窄', '深': '深',
  '浅': '淺', '厚': '厚', '薄': '薄', '重': '重', '轻': '輕', '快': '快',
  '慢': '慢', '新': '新', '旧': '舊', '好': '好', '坏': '壞', '美': '美',
  '丑': '醜', '强': '強', '弱': '弱', '勇': '勇', '怯': '怯', '智': '智',
  
  // 舰娘特定名称
  '苍': '蒼', '岚': '嵐', '潮': '潮', '满': '滿', '荒': '荒', '矶': '磯',
  '浦': '浦', '滨': '濱', '洲': '洲', '崎': '崎', '谷': '谷', '泽': '澤',
  '野': '野', '原': '原', '田': '田', '冈': '岡', '坂': '坂', '丘': '丘',
  '台': '臺', '城': '城', '宫': '宮', '殿': '殿', '楼': '樓', '阁': '閣',
  '桥': '橋', '门': '門', '关': '關', '口': '口', '港': '港', '湾': '灣',
  '角': '角', '岬': '岬', '崖': '崖', '峰': '峰', '顶': '頂', '麓': '麓',
  
  // 日式汉字特殊情况
  '叶': '葉', '枫': '楓', '菊': '菊', '兰': '蘭', '莲': '蓮', '荷': '荷',
  '蝶': '蝶', '鹤': '鶴', '鹰': '鷹', '燕': '燕', '雀': '雀', '鸦': '鴉',
  '鸽': '鴿', '鸥': '鷗', '鸢': '鳶', '隼': '隼', '鹞': '鷂', '鹫': '鷲',
  '虎': '虎', '豹': '豹', '狼': '狼', '熊': '熊', '猫': '貓', '犬': '犬',
  '马': '馬', '牛': '牛', '羊': '羊', '猪': '豬', '鸡': '雞', '鸭': '鴨',
  '鹅': '鵝', '鱼': '魚', '虾': '蝦', '蟹': '蟹', '龟': '龜', '蛇': '蛇',
  
  // 数字和方位
  '一': '一', '二': '二', '三': '三', '四': '四', '五': '五',
  '六': '六', '七': '七', '八': '八', '九': '九', '十': '十',
  '百': '百', '千': '千', '万': '萬', '亿': '億',
  '东': '東', '西': '西', '南': '南', '北': '北', '中': '中',
  '上': '上', '下': '下', '左': '左', '右': '右', '前': '前', '后': '後',
  '内': '內', '外': '外', '正': '正', '副': '副', '主': '主', '次': '次',
  
  // 军事相关
  '军': '軍', '兵': '兵', '战': '戰', '斗': '鬥', '击': '擊', '攻': '攻',
  '防': '防', '守': '守', '护': '護', '卫': '衛', '队': '隊', '团': '團',
  '师': '師', '旅': '旅', '营': '營', '连': '連', '排': '排', '班': '班',
  '组': '組', '员': '員', '长': '長', '官': '官', '将': '將', '帅': '帥',
  '王': '王', '皇': '皇', '帝': '帝', '后': '後', '妃': '妃', '姬': '姬',
  '君': '君', '主': '主', '公': '公', '侯': '侯', '伯': '伯', '子': '子',
  
  // 其他常用字
  '国': '國', '中': '中', '华': '華', '民': '民', '族': '族', '文': '文',
  '化': '化', '历': '歷', '史': '史', '传': '傳', '统': '統', '现': '現',
  '代': '代', '当': '當', '时': '時', '间': '間', '空': '空', '世': '世',
  '纪': '紀', '年': '年', '岁': '歲', '期': '期', '季': '季', '度': '度'
}

// 繁体转简体对照表（自动生成）
const TRADITIONAL_TO_SIMPLIFIED = {}
Object.keys(SIMPLIFIED_TO_TRADITIONAL).forEach(key => {
  const value = SIMPLIFIED_TO_TRADITIONAL[key]
  TRADITIONAL_TO_SIMPLIFIED[value] = key
})

/**
 * 将简体字转换为繁体字
 * @param {string} text 输入文本
 * @returns {string} 转换后的文本
 */
export function toTraditional(text) {
  if (!text) return text
  
  return text.split('').map(char => {
    return SIMPLIFIED_TO_TRADITIONAL[char] || char
  }).join('')
}

/**
 * 将繁体字转换为简体字
 * @param {string} text 输入文本
 * @returns {string} 转换后的文本
 */
export function toSimplified(text) {
  if (!text) return text
  
  return text.split('').map(char => {
    return TRADITIONAL_TO_SIMPLIFIED[char] || char
  }).join('')
}

/**
 * 根据舰娘名称获取拼音列表
 * @param {string} shipName 舰娘名称
 * @returns {string[]} 拼音列表
 */
export function getShipPinyin(shipName) {
  if (!shipName) return []
  
  // 直接查找映射表
  if (SHIP_NAME_PINYIN[shipName]) {
    return SHIP_NAME_PINYIN[shipName]
  }
  
  // 尝试简繁体转换后查找
  const traditional = toTraditional(shipName)
  if (SHIP_NAME_PINYIN[traditional]) {
    return SHIP_NAME_PINYIN[traditional]
  }
  
  const simplified = toSimplified(shipName)
  if (SHIP_NAME_PINYIN[simplified]) {
    return SHIP_NAME_PINYIN[simplified]
  }
  
  return []
}

/**
 * 检查搜索文本是否匹配舰娘的拼音
 * @param {string} searchText 搜索文本
 * @param {string} shipName 舰娘名称
 * @returns {boolean} 是否匹配
 */
export function matchPinyin(searchText, shipName) {
  if (!searchText || !shipName) return false
  
  const searchLower = searchText.toLowerCase()
  const pinyinList = getShipPinyin(shipName)
  
  return pinyinList.some(pinyin => 
    pinyin.toLowerCase().includes(searchLower)
  )
}

/**
 * 标准化舰娘名称，移除改造后缀
 * @param {string} shipName 舰娘名称
 * @returns {string} 标准化后的名称
 */
export function normalizeShipName(shipName) {
  if (!shipName) return shipName
  
  // 移除常见的改造后缀
  const suffixes = [
    'два', 'drei', 'due', 'Mk.II', 'mk2', 'MkII', 'Mark II',
    '改二丙', '改二乙', '改二甲', '改二戊', '改二丁',
    '改二', '改', 
    '乙改', '甲改', '丙改', '丁改', '戊改',
    '乙', '甲', '丙', '丁', '戊',
    'Kai Ni', 'Kai',
    '(Kai Ni)', '(Kai)',
    '級', '级',
    '型', '形'
  ]
  
  let normalized = shipName.trim()
  
  // 按照长度从长到短排序，优先匹配更长的后缀
  const sortedSuffixes = suffixes.sort((a, b) => b.length - a.length)
  
  for (const suffix of sortedSuffixes) {
    if (normalized.endsWith(suffix)) {
      normalized = normalized.slice(0, -suffix.length).trim()
      break // 只移除一个后缀
    }
  }
  
  return normalized
}

/**
 * 智能匹配函数，支持简繁体互相匹配、拼音搜索和忽略改造后缀
 * @param {string} searchText 搜索文本
 * @param {string} targetText 目标文本
 * @returns {boolean} 是否匹配
 */
export function smartMatch(searchText, targetText) {
  if (!searchText || !targetText) return false
  
  const searchLower = searchText.toLowerCase().trim()
  const targetLower = targetText.toLowerCase().trim()
  
  // 标准化的名称（移除改造后缀）
  const normalizedSearch = normalizeShipName(searchText).toLowerCase()
  const normalizedTarget = normalizeShipName(targetText).toLowerCase()
  
  // 1. 直接匹配（原始名称）
  if (targetLower.includes(searchLower)) {
    return true
  }
  
  // 2. 标准化名称匹配
  if (normalizedTarget.includes(normalizedSearch)) {
    return true
  }
  
  // 3. 搜索标准化名称匹配原始目标
  if (targetLower.includes(normalizedSearch)) {
    return true
  }
  
  // 4. 原始搜索匹配标准化目标
  if (normalizedTarget.includes(searchLower)) {
    return true
  }
  
  // 5. 将搜索文本转换为繁体后匹配
  const searchTraditional = toTraditional(searchText).toLowerCase()
  if (targetLower.includes(searchTraditional)) {
    return true
  }
  
  // 6. 标准化后的繁体匹配
  const normalizedSearchTraditional = toTraditional(normalizedSearch)
  if (normalizedTarget.includes(normalizedSearchTraditional)) {
    return true
  }
  
  // 7. 将目标文本转换为简体后匹配
  const targetSimplified = toSimplified(targetText).toLowerCase()
  if (targetSimplified.includes(searchLower)) {
    return true
  }
  
  // 8. 标准化后的简体匹配
  const normalizedTargetSimplified = toSimplified(normalizedTarget)
  if (normalizedTargetSimplified.includes(normalizedSearch)) {
    return true
  }
  
  // 9. 都转换为繁体后匹配
  const targetTraditional = toTraditional(targetText).toLowerCase()
  if (targetTraditional.includes(searchTraditional)) {
    return true
  }
  
  // 10. 都转换为简体后匹配
  const searchSimplified = toSimplified(searchText).toLowerCase()
  if (targetSimplified.includes(searchSimplified)) {
    return true
  }
  
  // 11. 拼音匹配（对原始名称）
  if (matchPinyin(searchText, targetText)) {
    return true
  }
  
  // 12. 拼音匹配（对标准化名称）
  if (matchPinyin(normalizedSearch, normalizedTarget)) {
    return true
  }
  
  // 13. 搜索标准化名称的拼音匹配原始目标
  if (matchPinyin(normalizedSearch, targetText)) {
    return true
  }
  
  // 14. 原始搜索的拼音匹配标准化目标
  if (matchPinyin(searchText, normalizedTarget)) {
    return true
  }
  
  return false
}

/**
 * 获取文本的所有可能变体（简体、繁体）
 * @param {string} text 输入文本
 * @returns {string[]} 所有变体
 */
export function getTextVariants(text) {
  if (!text) return []
  
  const variants = new Set()
  variants.add(text)
  variants.add(toSimplified(text))
  variants.add(toTraditional(text))
  
  return Array.from(variants)
}

export default {
  toTraditional,
  toSimplified,
  smartMatch,
  getTextVariants,
  getShipPinyin,
  matchPinyin,
  normalizeShipName
}