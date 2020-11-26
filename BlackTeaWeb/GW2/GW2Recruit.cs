using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace BlackTeaWeb
{
	public class RecruitInfo
	{
		public int id;

		public long senderId;

		public string desc;

		public long timestamp;

		public override string ToString()
		{
			return $"【{id}】发布者:{senderId} [{desc}]";
		}
	}

	public static class GW2Recruit
	{
		private static List<RecruitInfo> recruitLst;
		private static int generateId;

		private static string webRoot;

		public static void Init(string webRoot)
		{
			GW2Recruit.webRoot = webRoot;
			recruitLst = new List<RecruitInfo>();

			recruitLst.Add(new RecruitInfo() {id = 1, senderId = 420975789, desc = "asdadada" });
		}

		public static string GetRecruitLst()
		{
			string retStr = "目前列表:\r\n";
			retStr += string.Join("\r\n", recruitLst);

			return retStr;
		}

		public static bool IsRecruiting(long senderId)
		{
			foreach (var info in recruitLst)
			{
				if (info.senderId == senderId)
					return true;
			}

			return false;
		}

		public static void InsertRecruit(long senderId, string rawMessage)
		{
			if (rawMessage.Length > 40)
			{
				rawMessage = rawMessage.Substring(0, 40);
			}

			recruitLst.Add(new RecruitInfo() { senderId = senderId, desc = rawMessage, id = generateId++, timestamp = DateTime.Now.Ticks });
		}

		public static RecruitInfo GetRecruitInfo(int id)
		{
			return recruitLst.Find((info)=> { return info.id == id; });
		}

		public static void SaveLst()
		{
			var lst = GW2Recruit.GetRecruitLst();
			var jsonStr = JsonConvert.SerializeObject(lst);

			var path = Path.Combine(webRoot, "data/recruit.txt");
			File.WriteAllText(path, jsonStr);
		}
	}
}
