import React from 'react';
import dayjs from 'dayjs';
import { SolarDate } from '@nghiavuive/lunar_date_vi';
import './lunarCalendarStyle.scss';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { ArrowLeftLight } from './icons/ArrowLeftLight';
import { ArrowRightLight } from './icons/ArrowRightLight';
import { ArrowRightIcon } from './icons/ArrowRightIcon';

interface Props {
	value?: Date;
	onChange?: (date: Date) => void;
	showLunarDate?: boolean;
	lunarFormat?: 'name' | 'number';
	localeOptions?: Intl.DateTimeFormatOptions;
	showToday?: boolean;
	locale?: string;
	maxDate?: Date;
	minDate?: Date;
	events?: { type: 'anually' | 'once'; date: Date; content: string; isLunar: boolean }[];
}

export const VietNameseEvents = [
	{
		type: 'anually',
		isLunar: false,
		date: new Date('2025-04-30'),
		content: 'Ngày Giải phóng miền Nam',
	},
	{
		type: 'anually',
		isLunar: false,
		date: new Date('2025-05-01'),
		content: 'Ngày Quốc tế Lao động',
	},
	{ type: 'anually', isLunar: false, date: new Date('2025-09-02'), content: 'Ngày Quốc khánh' },
	{
		type: 'anually',
		isLunar: true,
		date: new Date('2025-01-01'),
		content: 'Mùng 1 Tết Nguyên đán',
	},
	{
		type: 'anually',
		isLunar: true,
		date: new Date('2025-01-02'),
		content: 'Mùng 2 Tết Nguyên đán',
	},
	{
		type: 'anually',
		isLunar: true,
		date: new Date('2025-01-03'),
		content: 'Mùng 3 Tết Nguyên đán',
	},
	{ type: 'anually', isLunar: true, date: new Date('2025-03-10'), content: 'Giỗ Tổ Hùng Vương' },
	{ type: 'anually', isLunar: false, date: new Date('2025-06-28'), content: 'Ngày Gia đình Việt Nam' },
	{ type: 'anually', isLunar: false, date: new Date('2025-10-20'), content: 'Ngày Phụ nữ Việt Nam' },
	{ type: 'anually', isLunar: false, date: new Date('2025-11-20'), content: 'Ngày Nhà giáo Việt Nam' },
	{
		type: 'anually',
		isLunar: false,
		date: new Date('2025-12-22'),
		content: 'Ngày thành lập Quân đội Nhân dân Việt Nam',
	},
	{
		type: 'anually',
		isLunar: true,
		date: new Date('2025-01-15'),
		content: 'Tết Nguyên tiêu',
	},
	{
		type: 'anually',
		isLunar: true,
		date: new Date('2025-04-15'),
		content: 'Lễ Phật Đản',
	},
	{
		type: 'anually',
		isLunar: true,
		date: new Date('2025-07-15'),
		content: 'Lễ Vu Lan',
	},
	{
		type: 'anually',
		isLunar: true,
		date: new Date('2025-08-15'),
		content: 'Tết Trung Thu',
	},
	{
		type: 'anually',
		isLunar: true,
		date: new Date('2025-12-23'),
		content: 'Tiễn Ông Táo về trời',
	},
	{
		type: 'anually',
		isLunar: false,
		date: new Date('2025-03-08'),
		content: 'Ngày Quốc tế Phụ nữ',
	},
	{
		type: 'anually',
		isLunar: false,
		date: new Date('2025-06-01'),
		content: 'Ngày Quốc tế Thiếu nhi',
	}
];

const LunarCalendar: React.FC<Props> = ({
	value,
	onChange,
	showLunarDate = true,
	lunarFormat = 'number',
	localeOptions = { weekday: 'narrow', month: 'long', year: 'numeric' },
	showToday = true,
	locale = 'vi',
	maxDate,
	minDate,
	events = VietNameseEvents,
}) => {
	const [selectedDate, setSelectedDate] = React.useState<Date>(value || new Date());
	const [currentMonth, setCurrentMonth] = React.useState(new Date());

	const isDateInRange = (date: Date) => {
		if (minDate && date < minDate) return false;
		if (maxDate && date > maxDate) return false;
		return true;
	};

	const handleDateSelect = (date: Date) => {
		if (!isDateInRange(date)) return;
		setSelectedDate(date);
		onChange?.(date);
	};

	const months = Array.from({ length: 12 }, (_, i) =>
		new Date(2000, i, 1).toLocaleString(locale, { month: 'long' })
	);

	const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - 50 + i);

	const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const newMonth = parseInt(e.target.value);
		setCurrentMonth(new Date(currentMonth.getFullYear(), newMonth));
	};

	const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const newYear = parseInt(e.target.value);
		setCurrentMonth(new Date(newYear, currentMonth.getMonth()));
	};

	const getEventsForDate = (date: Date) => {
		return events.filter((event) => {
			if (event.type === 'once') {
				return date.toDateString() === event.date.toDateString();
			} else if (event.type === 'anually') {
				const eventDate = event.date;
				if (event.isLunar) {
					// Convert both dates to lunar for comparison
					const currentLunar = new SolarDate(date).toLunarDate();
					const eventLunar = new SolarDate(eventDate).toLunarDate();
					return (
						currentLunar.get().month === eventLunar.get().month &&
						currentLunar.get().day === eventLunar.get().day
					);
				} else {
					// Solar date comparison
					return (
						date.getMonth() === eventDate.getMonth() &&
						date.getDate() === eventDate.getDate()
					);
				}
			}
			return false;
		});
	};

	const renderCalendar = () => {
		const year = currentMonth.getFullYear();
		const month = currentMonth.getMonth();
		const firstDay = new Date(year, month, 1);
		const lastDay = new Date(year, month + 1, 0);
		const today = new Date();
		const days = [];

		// Add weekday headers
		const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((_, index) => {
			const date = new Date(2024, 0, index + 1); // Using a fixed date for weekday names
			return date.toLocaleString(locale, { weekday: localeOptions?.weekday });
		});

		const weekdayElements = weekdays.map((day, index) => (
			<div
				key={day}
				className={`weekday ${index === 6 ? 'sunday' : ''}`}>
				{day}
			</div>
		));
		// Add empty cells for days before the first day of the month
		const firstDayOfWeek = firstDay.getDay() || 7; // Convert Sunday (0) to 7
		for (let i = 1; i < firstDayOfWeek; i++) {
			days.push(
				<div
					key={`empty-${i}`}
					className='calendar-day empty'></div>
			);
		}
		// Add days of the month
		for (let i = 1; i <= lastDay.getDate(); i++) {
			const date = new Date(year, month, i);
			const lunarDate = new SolarDate(date).toLunarDate();
			const isSunday = date.getDay() === 0;
			const isToday = showToday && date.toDateString() === today.toDateString();
			const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
			const isFirstDayOfMonth = lunarDate.get().day === 1;
			const isDisabled = !isDateInRange(date);
			const dateEvents = getEventsForDate(date);

			days.push(
				<div
					key={i}
					className={`calendar-day ${isSunday ? 'sunday' : ''} ${
						isToday ? 'today' : ''
					} ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''} ${
						dateEvents.length > 0 ? 'has-event' : ''
					}`}
					onClick={() => !isDisabled && handleDateSelect(date)}>
					<div className='solar-date'>{i}</div>
					{showLunarDate && (
						<div className='lunar-date'>
							{lunarFormat === 'number'
								? isFirstDayOfMonth
									? `${lunarDate.get().day}/${lunarDate.get().month}`
									: lunarDate.get().day
								: isFirstDayOfMonth
								? `${lunarDate.getDayName()} ${lunarDate.getMonthName()}`
								: lunarDate.getDayName()}
						</div>
					)}
					{dateEvents.length > 0 &&
						dateEvents.map((event) => (
							<div
								className='event-indicator'
								title={event.content}>
								• {event.content}
							</div>
						))}
				</div>
			);
		}

		return (
			<>
				<div className='weekdays'>{weekdayElements}</div>
				<div className='calendar-grid'>{days}</div>
			</>
		);
	};

	return (
		<div className='lunar-calendar'>
			<div className='calendar-header'>
				<div className='header-left'>
					<button
						onClick={() =>
							setCurrentMonth(
								new Date(currentMonth.getFullYear() - 1, currentMonth.getMonth())
							)
						}>
						<ArrowLeftIcon style={{ width: '20px', height: '20px' }} />
					</button>
					<button
						onClick={() =>
							setCurrentMonth(
								new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
							)
						}>
						<ArrowLeftLight style={{ width: '20px', height: '20px' }} />
					</button>
				</div>

				<div className='header-center'>
					<select
						value={currentMonth.getMonth()}
						onChange={handleMonthChange}>
						{months.map((month, index) => (
							<option
								key={index}
								value={index}>
								{month}
							</option>
						))}
					</select>
					<select
						value={currentMonth.getFullYear()}
						onChange={handleYearChange}>
						{years.map((year) => (
							<option
								key={year}
								value={year}>
								{year}
							</option>
						))}
					</select>
				</div>

				<div className='header-right'>
					<button
						onClick={() =>
							setCurrentMonth(
								new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
							)
						}>
						<ArrowRightLight style={{ width: '20px', height: '20px' }} />
					</button>
					<button
						onClick={() =>
							setCurrentMonth(
								new Date(currentMonth.getFullYear() + 1, currentMonth.getMonth())
							)
						}>
						<ArrowRightIcon style={{ width: '20px', height: '20px' }} />
					</button>
				</div>
			</div>
			{renderCalendar()}
		</div>
	);
};

export default LunarCalendar;
