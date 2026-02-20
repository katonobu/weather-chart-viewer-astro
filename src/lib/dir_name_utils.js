
export const get_date_time_from_dir_name = (dir) => {
	// 年月日・時分を抽出
	const year = dir.slice(0, 4);
	const month = dir.slice(4, 6);
	const day = dir.slice(6, 8);
	const hour = dir.slice(9, 11);
	const min = dir.slice(11, 13);
	// タイムスタンプ文字列
	const timeStampStr = `${year}年${month}月${day}日 ${hour}時${min}分`;

    return timeStampStr
}

export const get_title_from_dir_name = (dir) => dir.endsWith("00")?"週間天気予報解説資料":"短期予報解説資料";

export const get_date_time_title_from_dir_name = (dir) => `${get_date_time_from_dir_name(dir)} ${get_title_from_dir_name(dir)}`;
