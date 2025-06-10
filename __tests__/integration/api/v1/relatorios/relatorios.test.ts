import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);

const BASE_URL = process.env.NEXT_PUBLIC_IMG_BASE_URL || "http://localhost:3000";

interface Report {
  seller_id: number;
  started_at: string;
  finished_at: string;
  activity_type: string;
  customer: string;
}

interface ReportResponse {
  data: Report[];
}

const login = async (): Promise<string> => {
  const res = await fetch(`${BASE_URL}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "emanuel", password: "123456" }),
  });

  expect(res.status).toBe(200);
  const body = await res.json();
  const token = body.token;
  expect(token).toBeDefined();
  return token;
};

const generateReportsData = (): Report[] => {
  const format = "DD/MM/YYYY HH:mm";
  return [
    {
      seller_id: 3,
      started_at: dayjs().tz("America/Sao_Paulo").format(format),
      finished_at: dayjs().add(10, "minute").tz("America/Sao_Paulo").format(format),
      activity_type: "cotacao",
      customer: "Cliente 1",
    },
    {
      seller_id: 3,
      started_at: dayjs().add(20, "minute").tz("America/Sao_Paulo").format(format),
      finished_at: dayjs().add(30, "minute").tz("America/Sao_Paulo").format(format),
      activity_type: "fechamento",
      customer: "Cliente 2",
    },
    {
      seller_id: 3,
      started_at: dayjs().add(40, "minute").tz("America/Sao_Paulo").format(format),
      finished_at: dayjs().add(50, "minute").tz("America/Sao_Paulo").format(format),
      activity_type: "servico",
      customer: "Cliente 3",
    },
  ];
};

describe("POST, GET, and DELETE multiple reports as a logged-in admin", () => {
  let token: string;
  let createdReportIds: number[] = [];

  test("should create 3 reports", async () => {
    token = await login();

    const reports = generateReportsData();

    const res = await fetch(`${BASE_URL}/api/v1/relatorios`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `token=${token}`,
      },
      body: JSON.stringify(reports),
    });

    expect(res.status).toBe(201);
    const body = await res.json() as ReportResponse;
    expect(body.data).toHaveLength(3);
    createdReportIds = body.data.map((r: { id: number }) => r.id);
  });

  test("should retrieve each created report", async () => {
    expect(createdReportIds.length).toBe(3);

    const expected = generateReportsData();

    for (const [index, id] of createdReportIds.entries()) {
      const res = await fetch(`${BASE_URL}/api/v1/relatorios?id=${id}`, {
        method: "GET",
        headers: {
          Cookie: `token=${token}`,
        },
      });

      expect(res.status).toBe(200);
      const { data } = await res.json() as ReportResponse;
      const report = expected[index];

      expect(data.seller_id).toBe(report.seller_id);
      expect(data.activity_type).toBe(report.activity_type);
      expect(data.customer).toBe(report.customer);
      expect(dayjs(data.started_at).tz("America/Sao_Paulo").format("DD/MM/YYYY HH:mm")).toBe(
        report.started_at
      );
      expect(dayjs(data.finished_at).tz("America/Sao_Paulo").format("DD/MM/YYYY HH:mm")).toBe(
        report.finished_at
      );
    }
  });

  test("should delete each created report", async () => {
    expect(createdReportIds.length).toBe(3);

    for (const id of createdReportIds) {
      const res = await fetch(`${BASE_URL}/api/v1/relatorios`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Cookie: `token=${token}`,
        },
        body: JSON.stringify({ id }),
      });

      expect(res.status).toBe(204);
    }
  });
});

