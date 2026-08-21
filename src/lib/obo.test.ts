import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthError, hentOboToken, OboError } from "./obo";
import { getToken, requestAzureOboToken, validateAzureToken } from "@navikt/oasis";

vi.mock("@navikt/oasis", () => ({
  getToken: vi.fn(),
  validateAzureToken: vi.fn(),
  requestAzureOboToken: vi.fn(),
}));

const request = new Request("http://localhost/api/utbetaltesummer");

beforeEach(() => {
  vi.resetAllMocks();
  process.env.SP_FORSIKRING_SCOPE = "api://dev-gcp.tbd.sp-forsikring/.default";
});

describe("hentOboToken", () => {
  it("avviser når innkommende token mangler", async () => {
    vi.mocked(getToken).mockReturnValue(null as never);

    await expect(hentOboToken(request)).rejects.toBeInstanceOf(AuthError);
    expect(validateAzureToken).not.toHaveBeenCalled();
  });

  it("avviser når innkommende token er ugyldig", async () => {
    vi.mocked(getToken).mockReturnValue("utløpt-token");
    vi.mocked(validateAzureToken).mockResolvedValue({
      ok: false,
      error: new Error("expired"),
      errorType: "token expired",
    });

    await expect(hentOboToken(request)).rejects.toBeInstanceOf(AuthError);
    expect(requestAzureOboToken).not.toHaveBeenCalled();
  });

  it("returnerer OBO-token med sp-forsikring som audience", async () => {
    vi.mocked(getToken).mockReturnValue("gyldig-token");
    vi.mocked(validateAzureToken).mockResolvedValue({ ok: true, payload: {} });
    vi.mocked(requestAzureOboToken).mockResolvedValue({ ok: true, token: "obo-token" });

    await expect(hentOboToken(request)).resolves.toBe("obo-token");
    expect(requestAzureOboToken).toHaveBeenCalledWith(
      "gyldig-token",
      "api://dev-gcp.tbd.sp-forsikring/.default",
    );
  });

  it("feiler når OBO-utvekslingen avslås", async () => {
    vi.mocked(getToken).mockReturnValue("gyldig-token");
    vi.mocked(validateAzureToken).mockResolvedValue({ ok: true, payload: {} });
    vi.mocked(requestAzureOboToken).mockResolvedValue({
      ok: false,
      error: new Error("avslått"),
    });

    await expect(hentOboToken(request)).rejects.toBeInstanceOf(OboError);
  });

  it("feiler når scope ikke er konfigurert", async () => {
    delete process.env.SP_FORSIKRING_SCOPE;
    vi.mocked(getToken).mockReturnValue("gyldig-token");
    vi.mocked(validateAzureToken).mockResolvedValue({ ok: true, payload: {} });

    await expect(hentOboToken(request)).rejects.toBeInstanceOf(OboError);
    expect(requestAzureOboToken).not.toHaveBeenCalled();
  });
});
