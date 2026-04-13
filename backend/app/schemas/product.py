from pydantic import BaseModel, ConfigDict


class ProductImageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    image_url: str
    sort_order: int


class ProductVariantResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    sku: str
    size: str
    color: str
    base_price: float
    sale_price: float | None
    stock: int


class ProductCard(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    brand: str
    category: str
    material: str | None = None
    base_price: float
    sale_price: float | None = None
    default_variant_id: int
    in_stock: bool
    image_url: str | None = None


class ProductDetailResponse(BaseModel):
    id: int
    name: str
    description: str
    brand: str
    category: str
    material: str | None
    variants: list[ProductVariantResponse]
    images: list[ProductImageResponse]


class ProductListResponse(BaseModel):
    items: list[ProductCard]
    total: int
    page: int
    page_size: int
