using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BlackTeaWeb
{
	public class RecruitInfo
	{
		public int id;

		public long senderId;

		public string desc;

		public override string ToString()
		{
			return $"【{id}】发布者:{senderId} [{desc}]";
		}
	}

	public static class GW2Recruit
	{
		private static List<RecruitInfo> recruitLst;
		private static int generateId;

		public static void Init()
		{
			recruitLst = new List<RecruitInfo>();
		}

		public static string GetRecruitLst()
		{
			string retStr = "目前列表:\r\n";
			retStr += string.Join("\r\n", recruitLst);

			return retStr;
		}

		public static void InsertRecruit(long senderId, string rawMessage)
		{
			var splits = rawMessage.Split('|');
			if (splits.Length > 1)
			{
				var desc = splits[1];
				recruitLst.Add(new RecruitInfo() { senderId = senderId, desc = desc, id = generateId++ });
			}
		}

		public static RecruitInfo GetRecruitInfo(int id)
		{
			return recruitLst.Find((info)=> { return info.id == id; });
		}
	}
}
