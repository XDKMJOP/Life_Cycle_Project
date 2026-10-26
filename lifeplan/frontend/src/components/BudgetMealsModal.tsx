import { useState, useMemo, useEffect } from 'react';
import { BUDGET_THAI_MEALS, type BudgetThaiMeal } from '../lib/budgetMealsData';

interface BudgetMealsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BudgetMealsModal({ isOpen, onClose }: BudgetMealsModalProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<'all' | 'under_30' | '30_50' | 'over_50'>('all');
  const [activeMealDetail, setActiveMealDetail] = useState<BudgetThaiMeal | null>(null);

  // Keyboard shortcut: Escape closes modal or detail card
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeMealDetail) {
          setActiveMealDetail(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeMealDetail, onClose]);

  const categories = useMemo(() => [
    { key: 'all', label: 'ทั้งหมด (150)' },
    { key: 'อาหารตามสั่ง', label: 'อาหารตามสั่ง (32)' },
    { key: 'ข้าวแกงและต้มจืด', label: 'ข้าวแกงและต้มจืด (29)' },
    { key: 'ก๋วยเตี๋ยวและจานเดียว', label: 'ก๋วยเตี๋ยวและจานเดียว (25)' },
    { key: 'ร้านสะดวกซื้อ 7-Eleven', label: 'ร้านสะดวกซื้อ 7-Eleven (23)' },
    { key: 'เมนูประหยัดทำเอง', label: 'เมนูประหยัดทำเอง (19)' },
    { key: 'อาหารว่างและผลไม้', label: 'อาหารว่างและผลไม้ (22)' },
  ], []);

  const filteredMeals = useMemo(() => {
    return BUDGET_THAI_MEALS.filter((meal) => {
      // Category filter
      if (activeCategory !== 'all' && meal.category !== activeCategory) {
        return false;
      }

      // Price filter
      if (priceRange === 'under_30' && meal.price_thb > 30) return false;
      if (priceRange === '30_50' && (meal.price_thb <= 30 || meal.price_thb > 50)) return false;
      if (priceRange === 'over_50' && meal.price_thb <= 50) return false;

      // Search filter
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const matchTh = meal.name_th.toLowerCase().includes(q);
        const matchEn = meal.name_en.toLowerCase().includes(q);
        const matchSrc = meal.source.toLowerCase().includes(q);
        const matchTip = meal.tip.toLowerCase().includes(q);
        if (!matchTh && !matchEn && !matchSrc && !matchTip) return false;
      }

      return true;
    });
  }, [activeCategory, priceRange, search]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="budget-meals-modal-card"
        style={{ height: '88vh', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bmm-header" style={{ flexShrink: 0 }}>
          <div className="bmm-header-text">
            <div className="bmm-badge-row">
              <span className="bmm-pill-badge">อาหารสุขภาพราคาประหยัด</span>
              <span className="bmm-pill-counter">100 เมนู</span>
            </div>
            <h2 className="bmm-title">เมนูอาหารไทยหาง่ายและประหยัด</h2>
            <p className="bmm-subtitle">
              เมนูตามสั่ง ข้าวแกง ก๋วยเตี๋ยว 7-Eleven ราคา 10 - 60 บาท
            </p>
          </div>
          <button
            type="button"
            className="bmm-close-btn"
            onClick={onClose}
            aria-label="Close"
            title="ปิดหน้าต่าง (Esc)"
          >
            ×
          </button>
        </div>

        {/* Search & Controls */}
        <div className="bmm-controls-bar" style={{ flexShrink: 0 }}>
          <div className="bmm-search-input-wrap">
            <svg className="bmm-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="bmm-search-input"
              placeholder="ค้นหาเมนู, วัตถุดิบ, แหล่งซื้อ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                className="bmm-clear-search-btn"
                onClick={() => setSearch('')}
              >
                ×
              </button>
            )}
          </div>

          {/* Price Range Filter Pills */}
          <div className="bmm-price-filters">
            <span className="bmm-filter-label">กรองราคา:</span>
            <button
              type="button"
              className={`bmm-price-pill ${priceRange === 'all' ? 'active' : ''}`}
              onClick={() => setPriceRange('all')}
            >
              ทั้งหมด
            </button>
            <button
              type="button"
              className={`bmm-price-pill ${priceRange === 'under_30' ? 'active' : ''}`}
              onClick={() => setPriceRange('under_30')}
            >
              ไม่เกิน 30 บาท
            </button>
            <button
              type="button"
              className={`bmm-price-pill ${priceRange === '30_50' ? 'active' : ''}`}
              onClick={() => setPriceRange('30_50')}
            >
              31 - 50 บาท
            </button>
            <button
              type="button"
              className={`bmm-price-pill ${priceRange === 'over_50' ? 'active' : ''}`}
              onClick={() => setPriceRange('over_50')}
            >
              51 - 60 บาท
            </button>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="bmm-category-scroll" style={{ flexShrink: 0, minHeight: '52px' }}>
          {categories.map((cat) => (
            <button
              key={cat.key}
              type="button"
              className={`bmm-category-tab ${activeCategory === cat.key ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.key)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Result Counter */}
        <div className="bmm-result-info" style={{ flexShrink: 0 }}>
          <span>พบ {filteredMeals.length} เมนู</span>
          {activeCategory !== 'all' && (
            <span className="bmm-active-filter-tag">หมวดหมู่: {activeCategory}</span>
          )}
          {priceRange !== 'all' && (
            <span className="bmm-active-filter-tag">
              ราคา: {priceRange === 'under_30' ? 'ไม่เกิน 30 บาท' : priceRange === '30_50' ? '31-50 บาท' : '51-60 บาท'}
            </span>
          )}
        </div>

        {/* Meals Grid */}
        <div className="bmm-grid-container" style={{ flex: '1 1 0', minHeight: 0, overflowY: 'auto' }}>
          {filteredMeals.length === 0 ? (
            <div className="bmm-empty-state">
              <p>ไม่พบเมนูอาหารที่ตรงกับการค้นหา</p>
              <button
                type="button"
                className="bmm-reset-btn"
                onClick={() => {
                  setSearch('');
                  setActiveCategory('all');
                  setPriceRange('all');
                }}
              >
                ล้างการค้นหาทั้งหมด
              </button>
            </div>
          ) : (
            filteredMeals.map((meal) => (
              <div
                key={meal.id}
                className="bmm-meal-card"
                style={{ minHeight: '380px', display: 'flex', flexDirection: 'column', flexShrink: 0 }}
                onClick={() => setActiveMealDetail(meal)}
              >
                <div className="bmm-card-img-wrap" style={{ height: '170px', minHeight: '170px', width: '100%', flexShrink: 0, position: 'relative' }}>
                  <img
                    src={meal.image || '/meals/meal_1.jpg'}
                    alt={meal.name_th}
                    className="bmm-card-img"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.src.includes('meal_1.jpg')) {
                        target.src = '/meals/meal_1.jpg';
                      }
                    }}
                  />
                  <div className="bmm-card-badges-overlay">
                    <span className="bmm-img-price-tag">~{meal.price_thb} บาท</span>
                    <span className="bmm-img-category-tag">{meal.category}</span>
                  </div>
                </div>

                <div className="bmm-card-content" style={{ display: 'flex', flexDirection: 'column', flex: '1 0 auto' }}>
                  <div className="bmm-card-title-row">
                    <h3 className="bmm-card-name-th">{meal.name_th}</h3>
                    <span className="bmm-card-kcal-tag">{meal.kcal} kcal</span>
                  </div>
                  <p className="bmm-card-name-en">{meal.name_en}</p>

                  <div className="bmm-card-source-row">
                    <span className="bmm-card-source-label">แหล่งซื้อ:</span>
                    <span className="bmm-card-source-val">{meal.source}</span>
                  </div>

                  <div className="bmm-card-macros-grid">
                    <div className="bmm-macro-cell">
                      <span className="bmm-macro-name">โปรตีน</span>
                      <span className="bmm-macro-val protein">{meal.protein_g}g</span>
                    </div>
                    <div className="bmm-macro-cell">
                      <span className="bmm-macro-name">คาร์บ</span>
                      <span className="bmm-macro-val carb">{meal.carb_g}g</span>
                    </div>
                    <div className="bmm-macro-cell">
                      <span className="bmm-macro-name">ไขมัน</span>
                      <span className="bmm-macro-val fat">{meal.fat_g}g</span>
                    </div>
                  </div>

                  <div className="bmm-card-tip-box">
                    <span className="bmm-tip-title">ทริคสั่งสุขภาพดี:</span>
                    <p className="bmm-tip-text">{meal.tip}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="bmm-footer" style={{ flexShrink: 0 }}>
          <span className="bmm-footer-note">
            ราคาโดยประมาณตามร้านค้าทั่วไป อาจแตกต่างกันตามทำเล
          </span>
          <button type="button" className="bmm-footer-close-btn" onClick={onClose}>
            ปิด
          </button>
        </div>
      </div>

      {/* Detail Popup on card click */}
      {activeMealDetail && (
        <div
          className="bmm-detail-overlay"
          onClick={(e) => {
            e.stopPropagation();
            setActiveMealDetail(null);
          }}
        >
          <div className="bmm-detail-card" onClick={(e) => e.stopPropagation()}>
            <div className="bmm-detail-header">
              <span className="bmm-img-price-tag large">~{activeMealDetail.price_thb} บาท</span>
              <button
                type="button"
                className="bmm-close-btn"
                onClick={() => setActiveMealDetail(null)}
              >
                ×
              </button>
            </div>

            <div className="bmm-detail-img-wrap">
              <img
                src={activeMealDetail.image}
                alt={activeMealDetail.name_th}
                className="bmm-detail-img"
              />
            </div>

            <div className="bmm-detail-body">
              <div className="bmm-detail-cat-badge">{activeMealDetail.category}</div>
              <h2 className="bmm-detail-title">{activeMealDetail.name_th}</h2>
              <p className="bmm-detail-subtitle">{activeMealDetail.name_en}</p>

              <div className="bmm-detail-source">
                <strong>พิกัดซื้อ / ร้าน:</strong> {activeMealDetail.source}
              </div>

              <div className="bmm-detail-nutrition-cards">
                <div className="bmm-d-nut-item">
                  <span className="d-label">พลังงาน</span>
                  <span className="d-value kcal">{activeMealDetail.kcal} kcal</span>
                </div>
                <div className="bmm-d-nut-item">
                  <span className="d-label">โปรตีน</span>
                  <span className="d-value protein">{activeMealDetail.protein_g} กรัม</span>
                </div>
                <div className="bmm-d-nut-item">
                  <span className="d-label">คาร์โบไฮเดรต</span>
                  <span className="d-value carb">{activeMealDetail.carb_g} กรัม</span>
                </div>
                <div className="bmm-d-nut-item">
                  <span className="d-label">ไขมัน</span>
                  <span className="d-value fat">{activeMealDetail.fat_g} กรัม</span>
                </div>
              </div>

              <div className="bmm-detail-tip-block">
                <h4>ทริคสั่งสุขภาพดี:</h4>
                <p>{activeMealDetail.tip}</p>
              </div>

              <button
                type="button"
                className="bmm-detail-back-btn"
                onClick={() => setActiveMealDetail(null)}
              >
                กลับสู่รายการ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
