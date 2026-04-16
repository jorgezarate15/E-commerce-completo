export function escapeRegex(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function parsePagination(query, defaults = { page: 1, pageSize: 20, maxPageSize: 100 }) {
	const rawPage = Number(query.page ?? defaults.page);
	const rawPageSize = Number(query.page_size ?? defaults.pageSize);

	const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : defaults.page;
	const boundedPageSize =
		Number.isFinite(rawPageSize) && rawPageSize > 0 ? Math.floor(rawPageSize) : defaults.pageSize;
	const pageSize = Math.min(boundedPageSize, defaults.maxPageSize);
	const skip = (page - 1) * pageSize;

	return { page, pageSize, skip };
}

export function parseDateParam(value, fieldName) {
	if (value === undefined || value === null || value === "") {
		return null;
	}

	const parsed = new Date(String(value));
	if (Number.isNaN(parsed.getTime())) {
		const error = new Error(`${fieldName} invalido`);
		error.status = 400;
		throw error;
	}

	return parsed;
}

export function parseSearchTerm(value, maxLength = 100) {
	const search = String(value ?? "").trim();
	if (!search) {
		return "";
	}
	return search.slice(0, maxLength);
}
